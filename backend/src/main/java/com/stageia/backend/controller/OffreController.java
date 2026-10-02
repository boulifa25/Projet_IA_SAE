package com.stageia.backend.controller;

import com.stageia.backend.dto.OffreRequest;
import com.stageia.backend.dto.OffreResponse;
import com.stageia.backend.dto.ia.OffreMatchingResultat;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.MatchingService;
import com.stageia.backend.service.OffreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
public class OffreController {

    private final OffreService offreService;
    private final MatchingService matchingService;

    @GetMapping
    public List<OffreResponse> listerPubliees() {
        return offreService.listerPubliees();
    }

    @GetMapping("/matching")
    @PreAuthorize("hasRole('ETUDIANT')")
    public List<OffreMatchingResultat> matching(@AuthenticationPrincipal UserPrincipal principal) {
        return matchingService.calculerMatching((Etudiant) principal.getUtilisateur());
    }

    @GetMapping("/mes-offres")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public List<OffreResponse> listerMesOffres(@AuthenticationPrincipal UserPrincipal principal) {
        return offreService.listerMesOffres((Entreprise) principal.getUtilisateur());
    }

    @GetMapping("/{id}")
    public OffreResponse detail(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return offreService.getDetail(id, principal.getUtilisateur());
    }

    @PostMapping
    @PreAuthorize("hasRole('ENTREPRISE')")
    public ResponseEntity<OffreResponse> creer(@Valid @RequestBody OffreRequest request,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        OffreResponse response = offreService.creer(request, (Entreprise) principal.getUtilisateur());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public OffreResponse modifier(@PathVariable Long id, @Valid @RequestBody OffreRequest request,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        return offreService.modifier(id, request, (Entreprise) principal.getUtilisateur());
    }

    @PostMapping("/{id}/publier")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public OffreResponse publier(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return offreService.publier(id, (Entreprise) principal.getUtilisateur());
    }

    @PostMapping("/{id}/cloturer")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public OffreResponse cloturer(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return offreService.cloturer(id, (Entreprise) principal.getUtilisateur());
    }
}
