package com.stageia.backend.service;

import com.stageia.backend.dto.RecommandationIAResponse;
import com.stageia.backend.model.Rapport;
import com.stageia.backend.model.RecommandationIA;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeRecommandation;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.RapportRepository;
import com.stageia.backend.repository.RecommandationIARepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Génère une synthèse automatique du parcours d'un étudiant en stage, destinée au
 * jury de soutenance : progression, points forts, points de vigilance (rapport,
 * module IA, fonctionnalité complémentaire à l'analyse de rapport au fil de l'eau).
 */
@Service
@RequiredArgsConstructor
public class SyntheseParcoursService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant pédagogique qui prépare une synthèse du parcours d'un étudiant en stage,
            à destination du jury de soutenance (enseignant référent, tuteur entreprise, administration).
            Tu reçois le sujet du stage et l'historique complet des rapports déposés ainsi que des analyses
            IA déjà générées au fil du stage (résumés, niveaux de risque détectés, conseils donnés).
            Rédige une synthèse claire et structurée en français, en 4 courts paragraphes :
            1. Résumé du déroulement du stage et de la progression de l'étudiant.
            2. Points forts observés.
            3. Points de vigilance ou difficultés rencontrées (et comment elles ont évolué).
            4. Une appréciation globale pour aider le jury à préparer ses questions.
            Réponds uniquement avec le texte de la synthèse, sans titre ni balises, ton professionnel
            et bienveillant.
            """;

    private final StageService stageService;
    private final RapportRepository rapportRepository;
    private final RecommandationIARepository recommandationIARepository;
    private final LlmService llmService;

    @Transactional
    public RecommandationIAResponse genererSynthese(Long stageId, Utilisateur demandeur) {
        Stage stage = stageService.getStageAccessible(stageId, demandeur);

        String contexte = construireContexte(stage);
        String synthese = llmService.demander(SYSTEM_PROMPT, contexte);

        RecommandationIA recommandation = new RecommandationIA();
        recommandation.setStage(stage);
        recommandation.setType(TypeRecommandation.SYNTHESE_PARCOURS);
        recommandation.setContenu(synthese);

        return new RecommandationIAResponse(recommandationIARepository.save(recommandation));
    }

    private String construireContexte(Stage stage) {
        List<Rapport> rapports = rapportRepository.findByStageOrderByDateDepotDesc(stage);
        List<RecommandationIA> historique = recommandationIARepository.findByStageOrderByDateGenerationDesc(stage);

        StringBuilder sb = new StringBuilder();
        sb.append("Étudiant : ").append(stage.getConvention().getCandidature().getEtudiant().getPrenom())
                .append(" ").append(stage.getConvention().getCandidature().getEtudiant().getNom()).append("\n");
        sb.append("Entreprise d'accueil : ").append(stage.getConvention().getCandidature().getOffre().getEntreprise().getRaisonSociale()).append("\n");
        sb.append("Sujet du stage : ").append(stage.getConvention().getSujet()).append("\n");
        sb.append("Période : du ").append(stage.getDateDebut().format(DATE_FORMAT))
                .append(" au ").append(stage.getDateFin().format(DATE_FORMAT)).append("\n\n");

        if (rapports.isEmpty()) {
            sb.append("Aucun rapport n'a été déposé durant ce stage.\n");
        } else {
            sb.append("Rapports déposés (").append(rapports.size()).append(") :\n");
            for (Rapport r : rapports) {
                sb.append("- [").append(r.getDateDepot().toString().substring(0, 10)).append("] ")
                        .append(r.getType()).append(" : ").append(r.getTitre());
                if (r.getCommentaire() != null && !r.getCommentaire().isBlank()) {
                    sb.append(" — ").append(r.getCommentaire());
                }
                sb.append("\n");
            }
        }

        List<RecommandationIA> resumes = historique.stream().filter(r -> r.getType() == TypeRecommandation.RESUME_RAPPORT).toList();
        List<RecommandationIA> risques = historique.stream().filter(r -> r.getType() == TypeRecommandation.ALERTE_RISQUE).toList();

        if (!resumes.isEmpty()) {
            sb.append("\nRésumés IA successifs des rapports :\n");
            resumes.forEach(r -> sb.append("- ").append(r.getContenu().replace("\n", " ")).append("\n"));
        }

        if (!risques.isEmpty()) {
            sb.append("\nNiveaux de risque de décrochage détectés au fil du temps (du plus récent au plus ancien) :\n");
            risques.forEach(r -> sb.append("- ").append(r.getNiveauRisque()).append(" : ").append(r.getContenu()).append("\n"));
        }

        return sb.toString();
    }
}
