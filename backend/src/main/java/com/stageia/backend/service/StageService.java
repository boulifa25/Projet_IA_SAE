package com.stageia.backend.service;

import com.stageia.backend.dto.StageResponse;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.RapportRepository;
import com.stageia.backend.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StageService {

    private final StageRepository stageRepository;
    private final RapportRepository rapportRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public StageResponse getMonStage(Long etudiantId) {
        List<Stage> stages = stageRepository.findByConvention_Candidature_Etudiant_IdOrderByDateCreationDesc(etudiantId);
        if (stages.isEmpty()) {
            throw new ResourceNotFoundException("Aucun stage trouvé pour cet étudiant.");
        }
        Stage stage = stages.get(0);
        return new StageResponse(stage, rapportRepository.findByStageOrderByDateDepotDesc(stage).size());
    }

    @Transactional(readOnly = true)
    public List<StageResponse> listerMesStages(Enseignant enseignant) {
        return stageRepository.findByConvention_EnseignantOrderByDateCreationDesc(enseignant)
                .stream()
                .map(stage -> new StageResponse(stage, rapportRepository.findByStageOrderByDateDepotDesc(stage).size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StageResponse> listerToutes() {
        return stageRepository.findAll().stream()
                .map(stage -> new StageResponse(stage, rapportRepository.findByStageOrderByDateDepotDesc(stage).size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StageResponse> listerStagesEntreprise(Entreprise entreprise) {
        return stageRepository.findByConvention_Candidature_Offre_EntrepriseOrderByDateCreationDesc(entreprise)
                .stream()
                .map(stage -> new StageResponse(stage, rapportRepository.findByStageOrderByDateDepotDesc(stage).size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public StageResponse getDetail(Long stageId, Utilisateur utilisateur) {
        Stage stage = getStageAccessible(stageId, utilisateur);
        return new StageResponse(stage, rapportRepository.findByStageOrderByDateDepotDesc(stage).size());
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource getAttestation(Long stageId, Utilisateur utilisateur) {
        Stage stage = getStageAccessible(stageId, utilisateur);
        if (stage.getAttestationFilename() == null) {
            throw new ResourceNotFoundException("Aucune attestation disponible pour ce stage.");
        }
        return fileStorageService.load(stage.getAttestationFilename());
    }

    @Transactional(readOnly = true)
    public Stage getStageAccessible(Long stageId, Utilisateur utilisateur) {
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage introuvable : " + stageId));

        boolean estEtudiant = stage.getConvention().getCandidature().getEtudiant().getId().equals(utilisateur.getId());
        boolean estEnseignant = stage.getConvention().getEnseignant() != null
                && stage.getConvention().getEnseignant().getId().equals(utilisateur.getId());
        boolean estEntreprise = stage.getConvention().getCandidature().getOffre().getEntreprise().getId().equals(utilisateur.getId());
        boolean estAdmin = utilisateur.getRole() == Role.ADMINISTRATEUR;

        if (!estEtudiant && !estEnseignant && !estEntreprise && !estAdmin) {
            throw new AccessDeniedException("Vous n'avez pas accès à ce stage.");
        }

        return stage;
    }
}
