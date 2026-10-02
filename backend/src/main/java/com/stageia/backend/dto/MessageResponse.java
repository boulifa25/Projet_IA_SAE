package com.stageia.backend.dto;

import com.stageia.backend.model.Message;
import com.stageia.backend.model.Role;
import lombok.Getter;

import java.time.Instant;

@Getter
public class MessageResponse {

    private final Long id;
    private final Long stageId;
    private final Long auteurId;
    private final String auteurNom;
    private final String auteurPrenom;
    private final Role auteurRole;
    private final String contenu;
    private final Instant dateEnvoi;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.stageId = message.getStage().getId();
        this.auteurId = message.getAuteur().getId();
        this.auteurNom = message.getAuteur().getNom();
        this.auteurPrenom = message.getAuteur().getPrenom();
        this.auteurRole = message.getAuteur().getRole();
        this.contenu = message.getContenu();
        this.dateEnvoi = message.getDateEnvoi();
    }
}
