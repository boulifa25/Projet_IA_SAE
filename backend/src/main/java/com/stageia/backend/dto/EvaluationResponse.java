package com.stageia.backend.dto;

import com.stageia.backend.model.Evaluation;
import com.stageia.backend.model.Role;
import lombok.Getter;

import java.time.Instant;

@Getter
public class EvaluationResponse {

    private final Long id;
    private final Long soutenanceId;
    private final Long evaluateurId;
    private final String evaluateurNom;
    private final Role evaluateurRole;
    private final String critere;
    private final Float note;
    private final String commentaire;
    private final Instant dateEvaluation;

    public EvaluationResponse(Evaluation evaluation) {
        this.id = evaluation.getId();
        this.soutenanceId = evaluation.getSoutenance().getId();
        this.evaluateurId = evaluation.getEvaluateur().getId();
        this.evaluateurNom = evaluation.getEvaluateur().getPrenom() + " " + evaluation.getEvaluateur().getNom();
        this.evaluateurRole = evaluation.getEvaluateur().getRole();
        this.critere = evaluation.getCritere();
        this.note = evaluation.getNote();
        this.commentaire = evaluation.getCommentaire();
        this.dateEvaluation = evaluation.getDateEvaluation();
    }
}
