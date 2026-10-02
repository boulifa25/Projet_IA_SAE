package com.stageia.backend.controller;

import com.stageia.backend.dto.CandidatureResponse;
import com.stageia.backend.dto.StatutCandidatureRequest;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.CandidatureService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
@RequiredArgsConstructor
@Validated
public class CandidatureController {

    private final CandidatureService candidatureService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<CandidatureResponse> postuler(
            @RequestParam @NotNull Long offreId,
            @RequestParam @NotBlank String lettreMotivation,
            @RequestParam("cv") MultipartFile cv,
            @AuthenticationPrincipal UserPrincipal principal) {

        CandidatureResponse response = candidatureService.postuler(
                offreId, lettreMotivation, cv, (Etudiant) principal.getUtilisateur());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mes-candidatures")
    @PreAuthorize("hasRole('ETUDIANT')")
    public List<CandidatureResponse> mesCandidatures(@AuthenticationPrincipal UserPrincipal principal) {
        return candidatureService.listerMesCandidatures((Etudiant) principal.getUtilisateur());
    }

    @GetMapping("/recues")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public List<CandidatureResponse> recues(@AuthenticationPrincipal UserPrincipal principal) {
        return candidatureService.listerRecues((Entreprise) principal.getUtilisateur());
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public CandidatureResponse changerStatut(@PathVariable Long id,
                                              @Valid @RequestBody StatutCandidatureRequest request,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return candidatureService.changerStatut(id, request.getStatut(), (Entreprise) principal.getUtilisateur());
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<Resource> telechargerCv(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Resource resource = candidatureService.getCv(id, principal.getUtilisateur());
        String filename = candidatureService.getCvOriginalName(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
