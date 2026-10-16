package com.stageia.backend.service;

import com.stageia.backend.dto.ia.CandidaturePreselectionResultat;
import com.stageia.backend.exception.IAServiceException;
import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Offre;
import com.stageia.backend.repository.CandidatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

/**
 * Pré-sélectionne automatiquement les candidatures reçues sur une offre, côté
 * entreprise : l'inverse du matching CV/offres côté étudiant (rapport, section 6.2).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PreselectionService {

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant qui aide une entreprise à présélectionner des candidatures de stage.
            Tu reçois le détail d'une offre de stage et la liste des candidatures reçues (profil de
            l'étudiant et lettre de motivation).
            Pour chaque candidature, évalue sa pertinence par rapport à l'offre : adéquation de la
            filière, cohérence et motivation réelle exprimée dans la lettre (pas seulement sa longueur
            ou son style), pertinence par rapport aux compétences recherchées.
            Réponds UNIQUEMENT avec un tableau JSON valide (aucun texte avant/après, pas de markdown),
            exactement dans ce format, une entrée par candidature reçue :
            [
              {"candidatureId": 1, "score": 85, "raison": "courte explication en une phrase"},
              {"candidatureId": 2, "score": 40, "raison": "courte explication en une phrase"}
            ]
            Le score va de 0 (aucun rapport) à 100 (candidature excellente).
            """;

    private final OffreService offreService;
    private final CandidatureRepository candidatureRepository;
    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<CandidaturePreselectionResultat> calculerPreselection(Long offreId, Entreprise entreprise) {
        Offre offre = offreService.getOwnedOffre(offreId, entreprise);
        List<Candidature> candidatures = candidatureRepository.findByOffreOrderByDateEnvoiDesc(offre);

        if (candidatures.isEmpty()) {
            return List.of();
        }

        String contexte = construireContexte(offre, candidatures);
        String reponseBrute = llmService.demander(SYSTEM_PROMPT, contexte);

        try {
            CandidaturePreselectionResultat[] resultats = objectMapper.readValue(nettoyerJson(reponseBrute), CandidaturePreselectionResultat[].class);
            return Arrays.asList(resultats);
        } catch (Exception e) {
            log.error("Réponse IA invalide pour la pré-sélection des candidatures : {}", reponseBrute, e);
            throw new IAServiceException("Le service IA a renvoyé une réponse invalide. Réessayez dans quelques instants.", e);
        }
    }

    private String construireContexte(Offre offre, List<Candidature> candidatures) {
        StringBuilder sb = new StringBuilder();
        sb.append("Offre de stage :\n");
        sb.append("- Titre : ").append(offre.getTitre()).append("\n");
        sb.append("- Filière recherchée : ").append(offre.getFiliere() != null ? offre.getFiliere() : "non précisée").append("\n");
        sb.append("- Compétences recherchées : ").append(String.join(", ", offre.getCompetencesRequises())).append("\n");
        sb.append("- Description : ").append(offre.getDescription()).append("\n\n");

        sb.append("Candidatures reçues :\n");
        for (Candidature c : candidatures) {
            sb.append("[ID: ").append(c.getId()).append("] ");
            sb.append("Étudiant : ").append(c.getEtudiant().getPrenom()).append(" ").append(c.getEtudiant().getNom());
            sb.append(" | Filière : ").append(c.getEtudiant().getFiliere() != null ? c.getEtudiant().getFiliere() : "non renseignée");
            sb.append(" | Promotion : ").append(c.getEtudiant().getPromotion() != null ? c.getEtudiant().getPromotion() : "non renseignée");
            sb.append("\nLettre de motivation : ").append(c.getLettreMotivation());
            sb.append("\n\n");
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
