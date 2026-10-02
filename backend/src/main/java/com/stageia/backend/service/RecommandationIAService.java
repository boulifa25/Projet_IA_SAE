package com.stageia.backend.service;

import com.stageia.backend.dto.AlerteRisqueResponse;
import com.stageia.backend.dto.RecommandationIAResponse;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeRecommandation;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.RecommandationIARepository;
import com.stageia.backend.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecommandationIAService {

    private final RecommandationIARepository recommandationIARepository;
    private final StageRepository stageRepository;
    private final StageService stageService;

    @Transactional(readOnly = true)
    public List<RecommandationIAResponse> listerPourStage(Long stageId, Utilisateur utilisateur) {
        Stage stage = stageService.getStageAccessible(stageId, utilisateur);
        return recommandationIARepository.findByStageOrderByDateGenerationDesc(stage)
                .stream().map(RecommandationIAResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<AlerteRisqueResponse> listerAlertesEnseignant(Enseignant enseignant) {
        List<Stage> stages = stageRepository.findByConvention_EnseignantOrderByDateCreationDesc(enseignant);

        return stages.stream()
                .map(stage -> recommandationIARepository
                        .findFirstByStageAndTypeOrderByDateGenerationDesc(stage, TypeRecommandation.ALERTE_RISQUE))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(AlerteRisqueResponse::new)
                .toList();
    }
}
