package com.stageia.backend.service;

import com.stageia.backend.dto.ia.CandidatureScoreResultat;
import com.stageia.backend.exception.IAServiceException;
import com.stageia.backend.model.Offre;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

/**
 * Évalue les chances réelles d'un étudiant d'obtenir une offre précise, à partir du
 * texte extrait de son CV (et non plus seulement de sa filière déclarée, cf. la
 * limite documentée du matching CV/offres) et de sa lettre de motivation. Appelé de
 * façon synchrone juste après l'envoi d'une candidature (rapport, section 6.2).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CandidatureScoringService {

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant qui évalue les chances réelles d'un étudiant d'obtenir une offre de
            stage précise, à partir du contenu de son CV et de sa lettre de motivation.
            Tu reçois le détail de l'offre (titre, filière recherchée, compétences requises,
            description) ainsi que le texte brut extrait du CV de l'étudiant et sa lettre de
            motivation. Base ton évaluation sur le contenu réel du CV (expériences, formations,
            compétences mentionnées explicitement), pas seulement sur une filière déclarée.
            Si le texte du CV est vide, illisible ou trop court pour être exploité (cas d'un CV
            scanné sous forme d'image sans texte sélectionnable), signale-le clairement dans le
            conseil plutôt que d'inventer un contenu qui n'y figure pas.
            Réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant/après, pas de markdown),
            exactement dans ce format :
            {
              "score": 72,
              "pointsForts": ["point fort 1 basé sur le CV", "point fort 2"],
              "pointsAmeliorer": ["point à améliorer 1", "point à améliorer 2"],
              "conseil": "conseil concret et actionnable en 1-2 phrases"
            }
            Le score va de 0 (aucune chance) à 100 (candidature idéale pour cette offre précise).
            """;

    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    public CandidatureScoreResultat evaluer(Offre offre, String cvTexte, String lettreMotivation) {
        String contexte = construireContexte(offre, cvTexte, lettreMotivation);
        String reponseBrute = llmService.demander(SYSTEM_PROMPT, contexte);

        try {
            return objectMapper.readValue(nettoyerJson(reponseBrute), CandidatureScoreResultat.class);
        } catch (Exception e) {
            log.error("Réponse IA invalide pour le score de candidature : {}", reponseBrute, e);
            throw new IAServiceException("Le service IA a renvoyé une réponse invalide.", e);
        }
    }

    private String construireContexte(Offre offre, String cvTexte, String lettreMotivation) {
        StringBuilder sb = new StringBuilder();
        sb.append("Offre de stage :\n");
        sb.append("- Titre : ").append(offre.getTitre()).append("\n");
        sb.append("- Filière recherchée : ").append(offre.getFiliere() != null ? offre.getFiliere() : "non précisée").append("\n");
        sb.append("- Compétences recherchées : ").append(String.join(", ", offre.getCompetencesRequises())).append("\n");
        sb.append("- Description : ").append(offre.getDescription()).append("\n\n");

        sb.append("Lettre de motivation :\n").append(lettreMotivation).append("\n\n");

        sb.append("Contenu du CV (texte extrait automatiquement du fichier PDF) :\n");
        if (cvTexte == null || cvTexte.isBlank()) {
            sb.append("[Aucun texte n'a pu être extrait de ce CV — il s'agit probablement d'un CV scanné "
                    + "sous forme d'image, sans texte sélectionnable.]");
        } else {
            sb.append(cvTexte);
        }

        return sb.toString();
    }

    private String nettoyerJson(String reponse) {
        String nettoye = reponse.trim();
        if (nettoye.startsWith("```")) {
            nettoye = nettoye.replaceFirst("^```[a-zA-Z]*\\n", "");
            nettoye = nettoye.replaceFirst("```\\s*$", "");
        }
        return nettoye.trim();
    }
}
