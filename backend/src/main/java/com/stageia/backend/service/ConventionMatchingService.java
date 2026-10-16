package com.stageia.backend.service;

import com.stageia.backend.dto.ia.ConventionMatchingResultat;
import com.stageia.backend.exception.IAServiceException;
import com.stageia.backend.model.Convention;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.repository.ConventionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

/**
 * Suggère aux enseignants, parmi les conventions en attente d'un référent, celles
 * les plus proches de leur spécialité (rapport, section 6.2 : étendre le matching
 * CV/offres aux conventions à prendre en charge).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConventionMatchingService {

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant qui aide des enseignants à choisir les conventions de stage qu'ils
            souhaitent encadrer, parmi celles en attente d'un référent.
            Tu reçois le profil de l'enseignant (spécialité, département) et une liste de conventions
            en attente, chacune avec le sujet du stage, la filière de l'étudiant et l'entreprise.
            Pour chaque convention, évalue la pertinence par rapport à la spécialité de l'enseignant.
            Réponds UNIQUEMENT avec un tableau JSON valide (aucun texte avant/après, pas de markdown),
            exactement dans ce format, une entrée par convention reçue :
            [
              {"conventionId": 1, "score": 85, "raison": "courte explication en une phrase"},
              {"conventionId": 2, "score": 30, "raison": "courte explication en une phrase"}
            ]
            Le score va de 0 (aucun rapport avec la spécialité) à 100 (correspondance excellente).
            """;

    private final ConventionRepository conventionRepository;
    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<ConventionMatchingResultat> calculerMatching(Enseignant enseignant) {
        List<Convention> enAttente = conventionRepository.findByValideeParEnseignantFalseOrderByDateGenerationDesc();

        if (enAttente.isEmpty()) {
            return List.of();
        }

        String contexte = construireContexte(enseignant, enAttente);
        String reponseBrute = llmService.demander(SYSTEM_PROMPT, contexte);

        try {
            ConventionMatchingResultat[] resultats = objectMapper.readValue(nettoyerJson(reponseBrute), ConventionMatchingResultat[].class);
            return Arrays.asList(resultats);
        } catch (Exception e) {
            log.error("Réponse IA invalide pour le matching des conventions : {}", reponseBrute, e);
            throw new IAServiceException("Le service IA a renvoyé une réponse invalide. Réessayez dans quelques instants.", e);
        }
    }

    private String construireContexte(Enseignant enseignant, List<Convention> conventions) {
        StringBuilder sb = new StringBuilder();
        sb.append("Profil de l'enseignant :\n");
        sb.append("- Spécialité : ").append(enseignant.getSpecialite() != null ? enseignant.getSpecialite() : "non renseignée").append("\n");
        sb.append("- Département : ").append(enseignant.getDepartement() != null ? enseignant.getDepartement() : "non renseigné").append("\n\n");

        sb.append("Conventions en attente d'un référent :\n");
        for (Convention c : conventions) {
            sb.append("[ID: ").append(c.getId()).append("] ");
            sb.append("Sujet : ").append(c.getSujet());
            sb.append(" | Filière étudiant : ").append(c.getCandidature().getEtudiant().getFiliere() != null ? c.getCandidature().getEtudiant().getFiliere() : "non renseignée");
            sb.append(" | Entreprise : ").append(c.getCandidature().getOffre().getEntreprise().getRaisonSociale());
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
