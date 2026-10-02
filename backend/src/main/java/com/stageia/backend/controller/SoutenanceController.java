package com.stageia.backend.controller;

import com.stageia.backend.dto.SoutenanceRequest;
import com.stageia.backend.dto.SoutenanceResponse;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.SoutenanceService;
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
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
public class SoutenanceController {

    private final SoutenanceService soutenanceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<SoutenanceResponse> planifier(@Valid @RequestBody SoutenanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(soutenanceService.planifier(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public List<SoutenanceResponse> toutes() {
        return soutenanceService.listerToutes();
    }

    @GetMapping("/stage/{stageId}")
    public SoutenanceResponse pourStage(@PathVariable Long stageId, @AuthenticationPrincipal UserPrincipal principal) {
        return soutenanceService.getPourStage(stageId, principal.getUtilisateur());
    }
}
