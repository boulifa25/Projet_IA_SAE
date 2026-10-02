package com.stageia.backend.controller;

import com.stageia.backend.dto.EvaluationResponse;
import com.stageia.backend.dto.EvaluationSubmitRequest;
import com.stageia.backend.dto.SoutenanceResponse;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ENTREPRISE')")
    public ResponseEntity<List<EvaluationResponse>> soumettre(@Valid @RequestBody EvaluationSubmitRequest request,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        List<EvaluationResponse> response = evaluationService.soumettre(
                request.getSoutenanceId(), request.getNotes(), principal.getUtilisateur());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/soutenance/{soutenanceId}")
    public List<EvaluationResponse> parSoutenance(@PathVariable Long soutenanceId) {
        return evaluationService.lister(soutenanceId);
    }

    @PostMapping("/soutenance/{soutenanceId}/finaliser")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public SoutenanceResponse finaliser(@PathVariable Long soutenanceId) {
        return evaluationService.finaliser(soutenanceId);
    }
}
