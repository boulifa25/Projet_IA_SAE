package com.stageia.backend.service;

import com.stageia.backend.dto.RapportResponse;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Rapport;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeRapport;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.RapportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RapportService {

    private final RapportRepository rapportRepository;
    private final FileStorageService fileStorageService;
    private final StageService stageService;

    @Transactional
    public RapportResponse deposer(Long stageId, TypeRapport type, String titre, String commentaire,
                                    MultipartFile fichier, Utilisateur etudiant) {
        Stage stage = stageService.getStageAccessible(stageId, etudiant);

        if (!stage.getConvention().getCandidature().getEtudiant().getId().equals(etudiant.getId())) {
            throw new AccessDeniedException("Seul l'étudiant concerné peut déposer un rapport sur ce stage.");
        }

        String filename = fileStorageService.storePdf(fichier);

        Rapport rapport = new Rapport();
        rapport.setStage(stage);
        rapport.setType(type);
        rapport.setTitre(titre);
        rapport.setCommentaire(commentaire);
        rapport.setFichierFilename(filename);
        rapport.setFichierOriginalName(fichier.getOriginalFilename());

        return new RapportResponse(rapportRepository.save(rapport));
    }

    @Transactional(readOnly = true)
    public List<RapportResponse> listerPourStage(Long stageId, Utilisateur utilisateur) {
        Stage stage = stageService.getStageAccessible(stageId, utilisateur);
        return rapportRepository.findByStageOrderByDateDepotDesc(stage)
                .stream().map(RapportResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public Resource getFichier(Long rapportId, Utilisateur utilisateur) {
        Rapport rapport = rapportRepository.findById(rapportId)
                .orElseThrow(() -> new ResourceNotFoundException("Rapport introuvable : " + rapportId));

        stageService.getStageAccessible(rapport.getStage().getId(), utilisateur);

        return fileStorageService.load(rapport.getFichierFilename());
    }

    @Transactional(readOnly = true)
    public String getFichierOriginalName(Long rapportId) {
        return rapportRepository.findById(rapportId)
                .orElseThrow(() -> new ResourceNotFoundException("Rapport introuvable : " + rapportId))
                .getFichierOriginalName();
    }
}
