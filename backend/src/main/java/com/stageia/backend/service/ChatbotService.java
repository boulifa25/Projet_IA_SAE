package com.stageia.backend.service;

import com.stageia.backend.dto.CandidatureResponse;
import com.stageia.backend.dto.ConventionResponse;
import com.stageia.backend.dto.DashboardStatsResponse;
import com.stageia.backend.dto.OffreResponse;
import com.stageia.backend.dto.SoutenanceResponse;
import com.stageia.backend.dto.StageResponse;
import com.stageia.backend.dto.ia.ConversationMessage;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Utilisateur;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Assistant conversationnel répondant aux questions administratives fréquentes
 * (rapport, section 6.2). Connaît le fonctionnement général de la plateforme et
 * le contexte personnel de l'utilisateur connecté (ses candidatures, son stage...).
 */
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private static final String CONNAISSANCE_PLATEFORME = """
            Tu es l'assistant virtuel de StageÉcole, une plateforme de gestion de stages. Tu réponds aux
            questions administratives et procédurales des utilisateurs de façon claire, concise (quelques
            phrases maximum) et bienveillante, uniquement en français.

            Voici comment fonctionne la plateforme :
            - Les entreprises publient des offres de stage (statut brouillon puis publiée).
            - Les étudiants recherchent les offres et postulent avec un CV (PDF) et une lettre de motivation.
            - L'entreprise examine les candidatures reçues et peut les accepter ou les refuser.
            - Quand une candidature est acceptée, une convention de stage est générée automatiquement.
            - La convention doit être validée par l'enseignant référent ET par l'administration avant que
              le stage démarre officiellement.
            - Une fois le stage en cours, l'étudiant dépose des rapports d'avancement réguliers, analysés
              automatiquement par un assistant IA (résumé, détection de risque de décrochage, conseils).
            - Une messagerie permet d'échanger entre l'étudiant, son enseignant référent et l'entreprise.
            - En fin de stage, l'administration planifie une soutenance (date, lieu ou lien visio, jury).
            - L'enseignant ET l'entreprise évaluent chacun le stage selon une grille de critères notés sur 20.
            - Une fois les deux évaluations reçues, l'administration finalise : la note finale est calculée
              automatiquement et l'attestation de stage est générée en PDF, téléchargeable par l'étudiant.

            Base-toi en priorité sur les informations personnelles ci-dessous si la question concerne la
            situation de l'utilisateur connecté. Si tu ne sais pas répondre avec certitude, dis-le
            simplement plutôt que d'inventer une réponse.
            """;

    private final CandidatureService candidatureService;
    private final ConventionService conventionService;
    private final StageService stageService;
    private final OffreService offreService;
    private final AdminDashboardService adminDashboardService;
    private final SoutenanceService soutenanceService;
    private final GeminiService geminiService;

    @Transactional(readOnly = true)
    public String repondre(String message, List<ConversationMessage> historique, Utilisateur utilisateur) {
        String systemPrompt = CONNAISSANCE_PLATEFORME + "\n\n" + construireContextePersonnalise(utilisateur);

        List<ConversationMessage> conversation = new java.util.ArrayList<>(historique);
        conversation.add(new ConversationMessage("user", message));

        return geminiService.demanderAvecHistorique(systemPrompt, conversation);
    }

    private String construireContextePersonnalise(Utilisateur utilisateur) {
        StringBuilder sb = new StringBuilder();
        sb.append("Informations personnelles de l'utilisateur connecté :\n");
        sb.append("- Nom : ").append(utilisateur.getPrenom()).append(" ").append(utilisateur.getNom()).append("\n");
        sb.append("- Rôle : ").append(utilisateur.getRole()).append("\n");

        if (utilisateur.getRole() == Role.ETUDIANT) {
            sb.append(contexteEtudiant((Etudiant) utilisateur));
        } else if (utilisateur.getRole() == Role.ENTREPRISE) {
            sb.append(contexteEntreprise((Entreprise) utilisateur));
        } else if (utilisateur.getRole() == Role.ENSEIGNANT) {
            sb.append(contexteEnseignant((Enseignant) utilisateur));
        } else if (utilisateur.getRole() == Role.ADMINISTRATEUR) {
            sb.append(contexteAdmin());
        }

        return sb.toString();
    }

    private String contexteEtudiant(Etudiant etudiant) {
        StringBuilder sb = new StringBuilder();
        List<CandidatureResponse> candidatures = candidatureService.listerMesCandidatures(etudiant);

        if (candidatures.isEmpty()) {
            sb.append("- Cet étudiant n'a postulé à aucune offre pour le moment.\n");
        } else {
            sb.append("- Candidatures de cet étudiant :\n");
            for (CandidatureResponse c : candidatures) {
                sb.append("  * ").append(c.getOffreTitre()).append(" chez ").append(c.getEntrepriseNom())
                        .append(" : statut ").append(c.getStatut()).append("\n");
            }
        }

        try {
            ConventionResponse convention = conventionService.getMaConvention(etudiant.getId());
            sb.append("- Convention de stage : référence ").append(convention.getReference())
                    .append(", statut ").append(convention.getStatut())
                    .append(" (validée par l'enseignant : ").append(convention.isValideeParEnseignant())
                    .append(", validée par l'administration : ").append(convention.isValideeParAdmin()).append(")\n");
        } catch (ResourceNotFoundException e) {
            sb.append("- Aucune convention de stage pour le moment.\n");
        }

        Long stageId = null;
        try {
            StageResponse stage = stageService.getMonStage(etudiant.getId());
            stageId = stage.getId();
            sb.append("- Stage chez ").append(stage.getEntrepriseNom())
                    .append(", statut ").append(stage.getStatut())
                    .append(", ").append(stage.getNombreRapports()).append(" rapport(s) déposé(s).\n");
        } catch (ResourceNotFoundException e) {
            sb.append("- Aucun stage actif pour le moment.\n");
        }

        if (stageId != null) {
            try {
                SoutenanceResponse soutenance = soutenanceService.getPourStage(stageId, etudiant);
                sb.append("- Soutenance : ").append(soutenance.getStatut())
                        .append(", prévue le ").append(soutenance.getDateSoutenance())
                        .append(" (").append(soutenance.getLieuOuLien()).append(").\n");
                if (soutenance.getNoteFinale() != null) {
                    sb.append("- Note finale obtenue : ").append(soutenance.getNoteFinale()).append(" / 20.\n");
                }
                sb.append("- Attestation de stage disponible : ")
                        .append(soutenance.isAttestationDisponible() ? "oui, téléchargeable depuis 'Mon stage'" : "pas encore").append("\n");
            } catch (ResourceNotFoundException e) {
                sb.append("- Aucune soutenance planifiée pour le moment.\n");
            }
        }

        return sb.toString();
    }

    private String contexteEntreprise(Entreprise entreprise) {
        StringBuilder sb = new StringBuilder();
        List<OffreResponse> offres = offreService.listerMesOffres(entreprise);
        sb.append("- Offres publiées par cette entreprise : ").append(offres.size()).append("\n");
        for (OffreResponse o : offres) {
            sb.append("  * ").append(o.getTitre()).append(" : statut ").append(o.getStatut())
                    .append(", ").append(o.getNombreCandidatures()).append(" candidature(s)\n");
        }

        List<CandidatureResponse> recues = candidatureService.listerRecues(entreprise);
        long enAttente = recues.stream().filter(c -> "EN_ATTENTE".equals(c.getStatut().name())).count();
        sb.append("- Candidatures reçues au total : ").append(recues.size())
                .append(" dont ").append(enAttente).append(" en attente de réponse.\n");

        return sb.toString();
    }

    private String contexteEnseignant(Enseignant enseignant) {
        StringBuilder sb = new StringBuilder();
        List<StageResponse> stages = stageService.listerMesStages(enseignant);
        sb.append("- Étudiants encadrés par cet enseignant : ").append(stages.size()).append("\n");
        for (StageResponse s : stages) {
            sb.append("  * ").append(s.getEtudiantPrenom()).append(" ").append(s.getEtudiantNom())
                    .append(" chez ").append(s.getEntrepriseNom()).append(" : statut ").append(s.getStatut()).append("\n");
        }

        List<ConventionResponse> mesConventions = conventionService.listerMesConventions(enseignant);
        long enAttenteAdmin = mesConventions.stream().filter(c -> !c.isValideeParAdmin()).count();
        sb.append("- Conventions encadrées : ").append(mesConventions.size())
                .append(" dont ").append(enAttenteAdmin).append(" en attente de validation administrative.\n");

        return sb.toString();
    }

    private String contexteAdmin() {
        DashboardStatsResponse stats = adminDashboardService.getStats();
        return "- Statistiques globales de la plateforme : " + stats.getOffresActives() + " offres actives, "
                + stats.getCandidaturesTotal() + " candidatures au total, " + stats.getEtudiantsPlaces()
                + " étudiants placés, " + stats.getEntreprisesPartenaires() + " entreprises partenaires.\n";
    }
}
