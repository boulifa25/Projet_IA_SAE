package com.stageia.backend.controller;

import com.stageia.backend.dto.StageResponse;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stages")
@RequiredArgsConstructor
public class StageController {

    private final StageService stageService;

    @GetMapping("/mon-stage")
    @PreAuthorize("hasRole('ETUDIANT')")
    public StageResponse monStage(@AuthenticationPrincipal UserPrincipal principal) {
        return stageService.getMonStage(principal.getUtilisateur().getId());
    }

    @GetMapping("/mes-stages")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public List<StageResponse> mesStages(@AuthenticationPrincipal UserPrincipal principal) {
        return stageService.listerMesStages((Enseignant) principal.getUtilisateur());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public List<StageResponse> toutes() {
        return stageService.listerToutes();
    }

    @GetMapping("/mes-stages-entreprise")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public List<StageResponse> mesStagesEntreprise(@AuthenticationPrincipal UserPrincipal principal) {
        return stageService.listerStagesEntreprise((Entreprise) principal.getUtilisateur());
    }

    @GetMapping("/{id}")
    public StageResponse detail(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return stageService.getDetail(id, principal.getUtilisateur());
    }

    @GetMapping("/{id}/attestation")
    public ResponseEntity<Resource> attestation(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Resource resource = stageService.getAttestation(id, principal.getUtilisateur());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"attestation-stage.pdf\"")
                .body(resource);
    }
}
