package com.stageia.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CritereNote {

    @NotBlank
    private String critere;

    @NotNull
    @DecimalMin("0")
    @DecimalMax("20")
    private Float note;

    private String commentaire;
}
