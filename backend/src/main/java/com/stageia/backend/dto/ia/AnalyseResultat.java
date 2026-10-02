package com.stageia.backend.dto.ia;

import java.util.List;

public record AnalyseResultat(
        String resume,
        String ton,
        List<String> pointsBloquants,
        String niveauRisque,
        String justificationRisque,
        String conseil
) {
}
