package com.stageia.backend.controller;

import com.stageia.backend.dto.ConventionResponse;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.ConventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
public class ConventionController {

    private final ConventionService conventionService;

    @GetMapping("/en-attente-enseignant")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public List<ConventionResponse> enAttenteEnseignant() {
        return conventionService.listerEnAttenteEnseignant();
    }

    @GetMapping("/mes-conventions")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public List<ConventionResponse> mesConventions(@AuthenticationPrincipal UserPrincipal principal) {
        return conventionService.listerMesConventions((Enseignant) principal.getUtilisateur());
    }

    @PostMapping("/{id}/valider-enseignant")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public ConventionResponse validerEnseignant(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return conventionService.validerParEnseignant(id, (Enseignant) principal.getUtilisateur());
    }

    @GetMapping("/a-valider-admin")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public List<ConventionResponse> aValiderAdmin() {
        return conventionService.listerAValiderAdmin();
    }

    @PostMapping("/{id}/valider-admin")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ConventionResponse validerAdmin(@PathVariable Long id) {
        return conventionService.validerParAdmin(id);
    }

    @GetMapping("/ma-convention")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ConventionResponse maConvention(@AuthenticationPrincipal UserPrincipal principal) {
        return conventionService.getMaConvention(principal.getUtilisateur().getId());
    }
}
