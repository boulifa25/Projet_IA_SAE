package com.stageia.backend.service;

import com.stageia.backend.model.Evaluation;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeNotification;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Détecte un écart anormal entre la note donnée par l'enseignant et celle donnée
 * par l'entreprise pour un même stage, et explique l'écart à l'administration
 * (rapport, section 6.2 : vigilance sur la cohérence des évaluations).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationAnalysisService {

    private static final float SEUIL_ECART = 4.0f;

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant qui aide l'administration d'une école à comprendre un écart important
            entre la note donnée par l'enseignant référent et celle donnée par le tuteur entreprise pour
            le même stage. Tu reçois les notes et commentaires de chaque évaluateur, critère par critère.
            Explique en 2-3 phrases, en français, les causes probables de cet écart en te basant sur les
            commentaires, et suggère un point de vigilance pour l'administration avant de finaliser.
            Réponds uniquement avec ce texte, sans titre ni balises.
            """;

    private final LlmService llmService;
    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    public void analyserEtNotifierSiEcart(List<Evaluation> evaluations, Stage stage) {
        Map<Role, List<Evaluation>> parRole = evaluations.stream()
                .collect(Collectors.groupingBy(e -> e.getEvaluateur().getRole()));

        List<Evaluation> notesEnseignant = parRole.get(Role.ENSEIGNANT);
        List<Evaluation> notesEntreprise = parRole.get(Role.ENTREPRISE);

        if (notesEnseignant == null || notesEntreprise == null) {
            return;
        }

        double moyenneEnseignant = notesEnseignant.stream().mapToDouble(Evaluation::getNote).average().orElse(0);
        double moyenneEntreprise = notesEntreprise.stream().mapToDouble(Evaluation::getNote).average().orElse(0);
        float ecart = (float) Math.abs(moyenneEnseignant - moyenneEntreprise);

        if (ecart < SEUIL_ECART) {
            return;
        }

        try {
            String contexte = construireContexte(stage, notesEnseignant, notesEntreprise, moyenneEnseignant, moyenneEntreprise);
            String explication = llmService.demander(SYSTEM_PROMPT, contexte);

            List<Utilisateur> admins = utilisateurRepository.findByRole(Role.ADMINISTRATEUR);
            String etudiantNom = stage.getConvention().getCandidature().getEtudiant().getPrenom()
                    + " " + stage.getConvention().getCandidature().getEtudiant().getNom();

            notificationService.creerPourPlusieurs(admins, TypeNotification.EVALUATION,
                    "Écart important entre les évaluations de " + etudiantNom,
                    explication,
                    "/app/admin/soutenances");
        } catch (Exception e) {
            // Un échec de cette analyse ne doit jamais bloquer la finalisation de la soutenance.
            log.error("Échec de l'analyse d'écart d'évaluation pour le stage {}", stage.getId(), e);
        }
    }

    private String construireContexte(Stage stage, List<Evaluation> notesEnseignant, List<Evaluation> notesEntreprise,
                                       double moyenneEnseignant, double moyenneEntreprise) {
        StringBuilder sb = new StringBuilder();
        sb.append("Sujet du stage : ").append(stage.getConvention().getSujet()).append("\n\n");

        sb.append("Évaluation de l'enseignant (moyenne ").append(String.format("%.1f", moyenneEnseignant)).append("/20) :\n");
        notesEnseignant.forEach(e -> sb.append("- ").append(e.getCritere()).append(" : ").append(e.getNote()).append("/20")
                .append(e.getCommentaire() != null && !e.getCommentaire().isBlank() ? " — " + e.getCommentaire() : "").append("\n"));

        sb.append("\nÉvaluation de l'entreprise (moyenne ").append(String.format("%.1f", moyenneEntreprise)).append("/20) :\n");
        notesEntreprise.forEach(e -> sb.append("- ").append(e.getCritere()).append(" : ").append(e.getNote()).append("/20")
                .append(e.getCommentaire() != null && !e.getCommentaire().isBlank() ? " — " + e.getCommentaire() : "").append("\n"));

        return sb.toString();
    }
}
