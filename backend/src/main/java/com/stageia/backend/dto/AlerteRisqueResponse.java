package com.stageia.backend.dto;

import com.stageia.backend.model.NiveauRisque;
import com.stageia.backend.model.RecommandationIA;
import lombok.Getter;

import java.time.Instant;

@Getter
public class AlerteRisqueResponse {

    private final Long stageId;
    private final String etudiantNom;
    private final String etudiantPrenom;
    private final String entrepriseNom;
    private final NiveauRisque niveauRisque;
    private final String justification;
    private final Instant dateGeneration;

    public AlerteRisqueResponse(RecommandationIA recommandation) {
        var stage = recommandation.getStage();
        this.stageId = stage.getId();
        this.etudiantNom = stage.getConvention().getCandidature().getEtudiant().getNom();
        this.etudiantPrenom = stage.getConvention().getCandidature().getEtudiant().getPrenom();
        this.entrepriseNom = stage.getConvention().getCandidature().getOffre().getEntreprise().getRaisonSociale();
        this.niveauRisque = recommandation.getNiveauRisque();
        this.justification = recommandation.getContenu();
        this.dateGeneration = recommandation.getDateGeneration();
    }
}
