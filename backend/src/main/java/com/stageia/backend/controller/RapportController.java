package com.stageia.backend.controller;

import com.stageia.backend.dto.RapportResponse;
import com.stageia.backend.model.TypeRapport;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.AnalyseRapportService;
import com.stageia.backend.service.RapportService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
@Validated
public class RapportController {

    private final RapportService rapportService;
    private final AnalyseRapportService analyseRapportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<RapportResponse> deposer(
            @RequestParam @NotNull Long stageId,
            @RequestParam @NotNull TypeRapport type,
            @RequestParam @NotBlank String titre,
            @RequestParam(required = false) String commentaire,
            @RequestParam("fichier") MultipartFile fichier,
            @AuthenticationPrincipal UserPrincipal principal) {

        RapportResponse response = rapportService.deposer(
                stageId, type, titre, commentaire, fichier, principal.getUtilisateur());

        // Déclenché après le commit de la transaction ci-dessus : l'analyse IA
        // tourne en tâche de fond sans jamais ralentir la réponse à l'étudiant.
        analyseRapportService.analyserRapport(response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/stage/{stageId}")
    public List<RapportResponse> parStage(@PathVariable Long stageId, @AuthenticationPrincipal UserPrincipal principal) {
        return rapportService.listerPourStage(stageId, principal.getUtilisateur());
    }

    @GetMapping("/{id}/fichier")
    public ResponseEntity<Resource> telecharger(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Resource resource = rapportService.getFichier(id, principal.getUtilisateur());
        String filename = rapportService.getFichierOriginalName(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
