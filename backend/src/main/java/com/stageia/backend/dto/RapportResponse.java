package com.stageia.backend.dto;

import com.stageia.backend.model.Rapport;
import com.stageia.backend.model.TypeRapport;
import lombok.Getter;

import java.time.Instant;

@Getter
public class RapportResponse {

    private final Long id;
    private final Long stageId;
    private final TypeRapport type;
    private final String titre;
    private final String commentaire;
    private final String fichierOriginalName;
    private final Instant dateDepot;

    public RapportResponse(Rapport rapport) {
        this.id = rapport.getId();
        this.stageId = rapport.getStage().getId();
        this.type = rapport.getType();
        this.titre = rapport.getTitre();
        this.commentaire = rapport.getCommentaire();
        this.fichierOriginalName = rapport.getFichierOriginalName();
        this.dateDepot = rapport.getDateDepot();
    }
}
