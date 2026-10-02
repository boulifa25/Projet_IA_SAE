package com.stageia.backend.service;

import com.stageia.backend.dto.ia.OffreMatchingResultat;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import com.stageia.backend.model.StatutOffre;
import com.stageia.backend.repository.OffreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

/**
 * Calcule un score de pertinence entre le profil d'un étudiant et les offres
 * de stage publiées (rapport, section 6.2 : "Matching CV / offres").
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant qui aide à faire correspondre des étudiants à des offres de stage.
            Tu reçois le profil d'un étudiant et une liste d'offres de stage disponibles.
            Pour chaque offre, évalue sa pertinence par rapport au profil de l'étudiant : proximité
            entre sa filière et le domaine de l'offre, recoupement entre ses compétences probables
            (déduites de sa filière) et les compétences requises par l'offre.
            Réponds UNIQUEMENT avec un tableau JSON valide (aucun texte avant/après, pas de markdown),
            exactement dans ce format, une entrée par offre reçue :
            [
              {"offreId": 1, "score": 85, "raison": "courte explication en une phrase"},
              {"offreId": 2, "score": 40, "raison": "courte explication en une phrase"}
            ]
            Le score va de 0 (aucun rapport) à 100 (correspondance excellente).
            """;

    private final OffreRepository offreRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<OffreMatchingResultat> calculerMatching(Etudiant etudiant) {
        List<Offre> offres = offreRepository.findByStatutOrderByDateCreationDesc(StatutOffre.PUBLIEE);

        if (offres.isEmpty()) {
            return List.of();
        }

        String contexte = construireContexte(etudiant, offres);
        String reponseBrute = geminiService.demander(SYSTEM_PROMPT, contexte);
        OffreMatchingResultat[] resultats = objectMapper.readValue(nettoyerJson(reponseBrute), OffreMatchingResultat[].class);

        return Arrays.asList(resultats);
    }

    private String construireContexte(Etudiant etudiant, List<Offre> offres) {
        StringBuilder sb = new StringBuilder();
        sb.append("Profil de l'étudiant :\n");
        sb.append("- Filière : ").append(etudiant.getFiliere() != null ? etudiant.getFiliere() : "non renseignée").append("\n");
        sb.append("- Promotion : ").append(etudiant.getPromotion() != null ? etudiant.getPromotion() : "non renseignée").append("\n\n");

        sb.append("Offres disponibles :\n");
        for (Offre offre : offres) {
            sb.append("[ID: ").append(offre.getId()).append("] ");
            sb.append("Titre: ").append(offre.getTitre());
            sb.append(" | Filière recherchée: ").append(offre.getFiliere() != null ? offre.getFiliere() : "non précisée");
            sb.append(" | Compétences: ").append(String.join(", ", offre.getCompetencesRequises()));
            sb.append(" | Description: ").append(offre.getDescription());
            sb.append("\n");
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
