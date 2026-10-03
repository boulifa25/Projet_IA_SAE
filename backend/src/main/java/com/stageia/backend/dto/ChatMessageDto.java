package com.stageia.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDto {

    @Pattern(regexp = "user|model")
    private String role;

    @NotBlank
    private String contenu;
}
