package com.stageia.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatbotRequest {

    @NotBlank
    private String message;

    @Valid
    private List<ChatMessageDto> historique = List.of();
}
