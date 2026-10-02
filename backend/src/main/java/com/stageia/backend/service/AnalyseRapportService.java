package com.stageia.backend.service;

import tools.jackson.databind.ObjectMapper;
import com.stageia.backend.dto.ia.AnalyseResultat;
import com.stageia.backend.model.Message;
import com.stageia.backend.model.NiveauRisque;
import com.stageia.backend.model.Rapport;
import com.stageia.backend.model.RecommandationIA;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeRecommandation;
import com.stageia.backend.repository.MessageRepository;
import com.stageia.backend.repository.RapportRepository;
import com.stageia.backend.repository.RecommandationIARepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Analyse un rapport d'avancement déposé par un étudiant : résumé, ton,
 * niveau de risque de décrochage et conseil personnalisé (rapport, section 6.2).
 * Déclenchée en asynchrone après le dépôt pour ne jamais ralentir l'étudiant.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyseRapportService {

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant pédagogique qui aide des enseignants à suivre des étudiants en stage.
            Tu reçois le contenu d'un rapport d'avancement ainsi que des indicateurs factuels sur son activité.
            Réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant ou après, pas de balises markdown),
            exactement dans ce format :
            {
              "resume": "résumé en 2-3 phrases du contenu du rapport",
              "ton": "engagé, neutre ou découragé",
              "pointsBloquants": ["point bloquant 1", "point bloquant 2"],
              "niveauRisque": "FAIBLE, MOYEN ou ELEVE",
              "justificationRisque": "explication courte et factuelle du niveau de risque choisi",
              "conseil": "un conseil personnalisé, concret et bienveillant pour l'étudiant"
            }
            Le niveau de risque doit refléter un vrai risque de décrochage (désengagement, retard, blocage
            persistant, isolement), pas juste une difficulté technique ponctuelle mentionnée avec sérénité.
            """;

    private final GeminiService geminiService;
    private final RapportRepository rapportRepository;
    private final MessageRepository messageRepository;
    private final RecommandationIARepository recommandationIARepository;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional
    public void analyserRapport(Long rapportId) {
        Rapport rapport = rapportRepository.findById(rapportId).orElse(null);
        if (rapport == null) {
            log.warn("Analyse IA annulée : rapport {} introuvable", rapportId);
            return;
        }

        Stage stage = rapport.getStage();

        try {
            String contexte = construireContexte(rapport, stage);
            String reponseBrute = geminiService.demander(SYSTEM_PROMPT, contexte);
            AnalyseResultat resultat = objectMapper.readValue(nettoyerJson(reponseBrute), AnalyseResultat.class);

            enregistrer(stage, rapport, TypeRecommandation.RESUME_RAPPORT, formaterResume(resultat), null);

            NiveauRisque niveau = parserNiveauRisque(resultat.niveauRisque());
            enregistrer(stage, rapport, TypeRecommandation.ALERTE_RISQUE, resultat.justificationRisque(), niveau);

            enregistrer(stage, rapport, TypeRecommandation.CONSEIL, resultat.conseil(), null);

            log.info("Analyse IA terminée pour le rapport {} (risque {})", rapportId, niveau);
        } catch (Exception e) {
            // Le dépôt du rapport a déjà réussi côté étudiant ; un échec de l'IA
            // (crédit API épuisé, réseau, JSON invalide...) ne doit jamais le remettre en cause.
            log.error("Échec de l'analyse IA du rapport {}", rapportId, e);
        }
    }

    private String construireContexte(Rapport rapport, Stage stage) {
        List<Rapport> historique = rapportRepository.findByStageOrderByDateDepotDesc(stage);
        long joursDepuisDebut = ChronoUnit.DAYS.between(stage.getDateDebut(), LocalDate.now());

        long joursDepuisRapportPrecedent = historique.size() > 1
                ? ChronoUnit.DAYS.between(
                        historique.get(1).getDateDepot().atZone(java.time.ZoneOffset.UTC).toLocalDate(),
                        LocalDate.now())
                : -1;

        List<Message> messagesRecents = messageRepository.findByStageOrderByDateEnvoiAsc(stage).stream()
                .filter(m -> ChronoUnit.DAYS.between(m.getDateEnvoi().atZone(java.time.ZoneOffset.UTC).toLocalDate(), LocalDate.now()) <= 14)
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("Sujet du stage : ").append(stage.getConvention().getSujet()).append("\n");
        sb.append("Stage démarré il y a ").append(joursDepuisDebut).append(" jours.\n");
        sb.append("Nombre total de rapports déposés jusqu'ici : ").append(historique.size()).append("\n");
        if (joursDepuisRapportPrecedent >= 0) {
            sb.append("Délai depuis le rapport précédent : ").append(joursDepuisRapportPrecedent).append(" jours.\n");
        } else {
            sb.append("Il s'agit du premier rapport déposé pour ce stage.\n");
        }
        sb.append("Messages échangés avec les tuteurs sur les 14 derniers jours : ").append(messagesRecents.size()).append("\n\n");
        sb.append("Titre du rapport : ").append(rapport.getTitre()).append("\n");
        sb.append("Type : ").append(rapport.getType()).append("\n");
        if (rapport.getCommentaire() != null && !rapport.getCommentaire().isBlank()) {
            sb.append("Contenu du rapport (commentaire de l'étudiant) :\n").append(rapport.getCommentaire());
        } else {
            sb.append("L'étudiant n'a pas laissé de commentaire texte, seulement le fichier PDF joint.");
        }

        return sb.toString();
    }

    private String formaterResume(AnalyseResultat resultat) {
        StringBuilder sb = new StringBuilder();
        sb.append(resultat.resume());
        sb.append("\n\nTon perçu : ").append(resultat.ton());
        if (resultat.pointsBloquants() != null && !resultat.pointsBloquants().isEmpty()) {
            sb.append("\nPoints bloquants identifiés : ").append(String.join(", ", resultat.pointsBloquants()));
        }
        return sb.toString();
    }

    private NiveauRisque parserNiveauRisque(String valeur) {
        try {
            return NiveauRisque.valueOf(valeur.trim().toUpperCase());
        } catch (Exception e) {
            log.warn("Niveau de risque IA non reconnu ('{}'), repli sur FAIBLE", valeur);
            return NiveauRisque.FAIBLE;
        }
    }

    private String nettoyerJson(String reponse) {
        String nettoye = reponse.trim();
        if (nettoye.startsWith("```")) {
            nettoye = nettoye.replaceFirst("^```[a-zA-Z]*\\n", "");
            nettoye = nettoye.replaceFirst("```\\s*$", "");
        }
        return nettoye.trim();
    }

    private void enregistrer(Stage stage, Rapport rapport, TypeRecommandation type, String contenu, NiveauRisque niveau) {
        RecommandationIA recommandation = new RecommandationIA();
        recommandation.setStage(stage);
        recommandation.setRapport(rapport);
        recommandation.setType(type);
        recommandation.setContenu(contenu);
        recommandation.setNiveauRisque(niveau);
        recommandationIARepository.save(recommandation);
    }
}
