package com.stageia.backend.controller;

import com.stageia.backend.dto.AlerteRisqueResponse;
import com.stageia.backend.dto.RecommandationIAResponse;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.RecommandationIAService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommandations")
@RequiredArgsConstructor
public class RecommandationIAController {

    private final RecommandationIAService recommandationIAService;

    @GetMapping("/stage/{stageId}")
    public List<RecommandationIAResponse> parStage(@PathVariable Long stageId, @AuthenticationPrincipal UserPrincipal principal) {
        return recommandationIAService.listerPourStage(stageId, principal.getUtilisateur());
    }

    @GetMapping("/mes-alertes")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public List<AlerteRisqueResponse> mesAlertes(@AuthenticationPrincipal UserPrincipal principal) {
        return recommandationIAService.listerAlertesEnseignant((Enseignant) principal.getUtilisateur());
    }
}
