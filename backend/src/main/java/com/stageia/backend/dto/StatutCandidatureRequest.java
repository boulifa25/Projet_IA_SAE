package com.stageia.backend.dto;

import com.stageia.backend.model.StatutCandidature;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatutCandidatureRequest {

    @NotNull
    private StatutCandidature statut;
}
