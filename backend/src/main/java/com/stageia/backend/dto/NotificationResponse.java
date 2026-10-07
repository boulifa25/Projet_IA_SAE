package com.stageia.backend.dto;

import com.stageia.backend.model.Notification;
import com.stageia.backend.model.TypeNotification;
import lombok.Getter;

import java.time.Instant;

@Getter
public class NotificationResponse {

    private final Long id;
    private final TypeNotification type;
    private final String titre;
    private final String message;
    private final String lien;
    private final boolean lu;
    private final Instant dateCreation;

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType();
        this.titre = notification.getTitre();
        this.message = notification.getMessage();
        this.lien = notification.getLien();
        this.lu = notification.isLu();
        this.dateCreation = notification.getDateCreation();
    }
}
