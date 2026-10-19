package com.stageia.backend.dto.ia;

import java.util.List;

/**
 * Résultat de l'évaluation IA des chances d'un étudiant d'obtenir une offre précise,
 * calculé à partir du texte réel de son CV et de sa lettre de motivation (rapport,
 * section 6.2 : évolution du matching CV/offres vers une analyse du contenu réel du CV).
 */
public record CandidatureScoreResultat(
        int score,
        List<String> pointsForts,
        List<String> pointsAmeliorer,
        String conseil
) {
}
