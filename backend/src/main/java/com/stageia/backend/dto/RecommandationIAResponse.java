package com.stageia.backend.dto;

import com.stageia.backend.model.NiveauRisque;
import com.stageia.backend.model.RecommandationIA;
import com.stageia.backend.model.TypeRecommandation;
import lombok.Getter;

import java.time.Instant;

@Getter
public class RecommandationIAResponse {

    private final Long id;
    private final Long stageId;
    private final Long rapportId;
    private final TypeRecommandation type;
    private final String contenu;
    private final NiveauRisque niveauRisque;
    private final Instant dateGeneration;

    public RecommandationIAResponse(RecommandationIA recommandation) {
        this.id = recommandation.getId();
        this.stageId = recommandation.getStage().getId();
        this.rapportId = recommandation.getRapport() != null ? recommandation.getRapport().getId() : null;
        this.type = recommandation.getType();
        this.contenu = recommandation.getContenu();
        this.niveauRisque = recommandation.getNiveauRisque();
        this.dateGeneration = recommandation.getDateGeneration();
    }
}
