package com.stageia.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EvaluationSubmitRequest {

    @NotNull
    private Long soutenanceId;

    @NotEmpty
    @Valid
    private List<CritereNote> notes;
}
