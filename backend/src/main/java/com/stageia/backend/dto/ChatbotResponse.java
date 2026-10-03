package com.stageia.backend.dto;

import lombok.Getter;

@Getter
public class ChatbotResponse {

    private final String reponse;

    public ChatbotResponse(String reponse) {
        this.reponse = reponse;
    }
}
