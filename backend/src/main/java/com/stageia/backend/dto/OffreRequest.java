package com.stageia.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class OffreRequest {

    @NotBlank
    private String titre;

    @NotBlank
    private String description;

    private String filiere;

    private String lieu;

    @Positive
    private Integer dureeMois;

    @NotNull
    @FutureOrPresent
    private LocalDate dateDebut;

    private List<String> competencesRequises;
}
