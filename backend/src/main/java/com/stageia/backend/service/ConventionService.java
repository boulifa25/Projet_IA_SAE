package com.stageia.backend.service;

import com.stageia.backend.dto.ConventionResponse;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Convention;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.StatutConvention;
import com.stageia.backend.model.StatutStage;
import com.stageia.backend.repository.ConventionRepository;
import com.stageia.backend.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConventionService {

    private final ConventionRepository conventionRepository;
    private final StageRepository stageRepository;

    @Transactional
    public Convention genererPourCandidature(Candidature candidature) {
        Convention convention = new Convention();
        convention.setCandidature(candidature);
        convention.setSujet(candidature.getOffre().getDescription());
        convention.setDateDebut(candidature.getOffre().getDateDebut());

        Integer dureeMois = candidature.getOffre().getDureeMois();
        convention.setDateFin(candidature.getOffre().getDateDebut()
                .plusMonths(dureeMois != null ? dureeMois : 6));

        convention.setReference(genererReference());

        return conventionRepository.save(convention);
    }

    private String genererReference() {
        String prefix = "CONV-" + Year.now().getValue() + "-";
        long count = conventionRepository.countByReferenceStartingWith(prefix) + 1;
        return prefix + String.format("%04d", count);
    }

    @Transactional(readOnly = true)
    public List<ConventionResponse> listerEnAttenteEnseignant() {
        return conventionRepository.findByValideeParEnseignantFalseOrderByDateGenerationDesc()
                .stream().map(ConventionResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ConventionResponse> listerMesConventions(Enseignant enseignant) {
        return conventionRepository.findByEnseignantOrderByDateGenerationDesc(enseignant)
                .stream().map(ConventionResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ConventionResponse> listerAValiderAdmin() {
        return conventionRepository.findByValideeParEnseignantTrueAndValideeParAdminFalseOrderByDateGenerationDesc()
                .stream().map(ConventionResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public ConventionResponse getMaConvention(Long etudiantId) {
        List<Convention> conventions = conventionRepository.findByCandidature_Etudiant_IdOrderByDateGenerationDesc(etudiantId);
        if (conventions.isEmpty()) {
            throw new ResourceNotFoundException("Aucune convention trouvée pour cet étudiant.");
        }
        return new ConventionResponse(conventions.get(0));
    }

    @Transactional
    public ConventionResponse validerParEnseignant(Long conventionId, Enseignant enseignant) {
        Convention convention = conventionRepository.findById(conventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Convention introuvable : " + conventionId));

        if (convention.getEnseignant() != null && !convention.getEnseignant().getId().equals(enseignant.getId())) {
            throw new AccessDeniedException("Cette convention est déjà prise en charge par un autre enseignant.");
        }

        convention.setEnseignant(enseignant);
        convention.setValideeParEnseignant(true);
        finaliserSiComplet(convention);

        return new ConventionResponse(conventionRepository.save(convention));
    }

    @Transactional
    public ConventionResponse validerParAdmin(Long conventionId) {
        Convention convention = conventionRepository.findById(conventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Convention introuvable : " + conventionId));

        convention.setValideeParAdmin(true);
        finaliserSiComplet(convention);

        return new ConventionResponse(conventionRepository.save(convention));
    }

    private void finaliserSiComplet(Convention convention) {
        if (convention.isValideeParEnseignant() && convention.isValideeParAdmin()) {
            convention.setStatut(StatutConvention.VALIDEE);

            if (stageRepository.findByConvention_Id(convention.getId()).isEmpty()) {
                Stage stage = new Stage();
                stage.setConvention(convention);
                stage.setDateDebut(convention.getDateDebut());
                stage.setDateFin(convention.getDateFin());
                stage.setStatut(StatutStage.EN_COURS);
                stageRepository.save(stage);
            }
        }
    }
}
