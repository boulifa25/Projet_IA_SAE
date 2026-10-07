package com.stageia.backend.service;

import com.stageia.backend.dto.SoutenanceRequest;
import com.stageia.backend.dto.SoutenanceResponse;
import com.stageia.backend.exception.ConflictException;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Soutenance;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeNotification;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.SoutenanceRepository;
import com.stageia.backend.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SoutenanceService {

    private final SoutenanceRepository soutenanceRepository;
    private final StageRepository stageRepository;
    private final StageService stageService;
    private final NotificationService notificationService;

    @Transactional
    public SoutenanceResponse planifier(SoutenanceRequest request) {
        Stage stage = stageRepository.findById(request.getStageId())
                .orElseThrow(() -> new ResourceNotFoundException("Stage introuvable : " + request.getStageId()));

        if (soutenanceRepository.findByStage_Id(stage.getId()).isPresent()) {
            throw new ConflictException("Une soutenance est déjà planifiée pour ce stage.");
        }

        Soutenance soutenance = new Soutenance();
        soutenance.setStage(stage);
        soutenance.setDateSoutenance(request.getDateSoutenance());
        soutenance.setLieuOuLien(request.getLieuOuLien());
        soutenance.setJury(request.getJury() != null ? request.getJury() : List.of());

        Soutenance saved = soutenanceRepository.save(soutenance);

        notificationService.creer(stage.getConvention().getCandidature().getEtudiant(), TypeNotification.SOUTENANCE,
                "Soutenance planifiée",
                "Votre soutenance est prévue le " + java.time.LocalDate.ofInstant(saved.getDateSoutenance(), java.time.ZoneId.systemDefault()) + " à " + saved.getLieuOuLien() + ".",
                "/app/etudiant/stage");

        return new SoutenanceResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SoutenanceResponse> listerToutes() {
        return soutenanceRepository.findAll().stream()
                .map(SoutenanceResponse::new)
                .sorted((a, b) -> b.getDateSoutenance().compareTo(a.getDateSoutenance()))
                .toList();
    }

    @Transactional(readOnly = true)
    public SoutenanceResponse getPourStage(Long stageId, Utilisateur utilisateur) {
        stageService.getStageAccessible(stageId, utilisateur);
        Soutenance soutenance = soutenanceRepository.findByStage_Id(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune soutenance planifiée pour ce stage."));
        return new SoutenanceResponse(soutenance);
    }

    @Transactional(readOnly = true)
    public Soutenance getEntite(Long soutenanceId) {
        return soutenanceRepository.findById(soutenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Soutenance introuvable : " + soutenanceId));
    }
}
