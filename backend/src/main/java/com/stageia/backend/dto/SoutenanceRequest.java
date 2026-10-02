package com.stageia.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class SoutenanceRequest {

    @NotNull
    private Long stageId;

    @NotNull
    private Instant dateSoutenance;

    @NotBlank
    private String lieuOuLien;

    private List<String> jury;
}
