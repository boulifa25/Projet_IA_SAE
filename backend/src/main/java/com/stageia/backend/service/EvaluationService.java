package com.stageia.backend.service;

import com.stageia.backend.dto.CritereNote;
import com.stageia.backend.dto.EvaluationResponse;
import com.stageia.backend.dto.SoutenanceResponse;
import com.stageia.backend.exception.ConflictException;
import com.stageia.backend.model.Evaluation;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Soutenance;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.StatutSoutenance;
import com.stageia.backend.model.StatutStage;
import com.stageia.backend.model.TypeNotification;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.EvaluationRepository;
import com.stageia.backend.repository.SoutenanceRepository;
import com.stageia.backend.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SoutenanceRepository soutenanceRepository;
    private final StageRepository stageRepository;
    private final SoutenanceService soutenanceService;
    private final AttestationService attestationService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional
    public List<EvaluationResponse> soumettre(Long soutenanceId, List<CritereNote> notes, Utilisateur evaluateur) {
        Soutenance soutenance = soutenanceService.getEntite(soutenanceId);
        Stage stage = soutenance.getStage();

        boolean estEnseignant = stage.getConvention().getEnseignant() != null
                && stage.getConvention().getEnseignant().getId().equals(evaluateur.getId());
        boolean estEntreprise = stage.getConvention().getCandidature().getOffre().getEntreprise().getId().equals(evaluateur.getId());

        if (!estEnseignant && !estEntreprise) {
            throw new AccessDeniedException("Vous n'êtes pas habilité à évaluer ce stage.");
        }

        if (evaluationRepository.existsBySoutenanceAndEvaluateur(soutenance, evaluateur)) {
            throw new ConflictException("Vous avez déjà soumis votre évaluation pour cette soutenance.");
        }

        List<Evaluation> evaluations = notes.stream().map(cn -> {
            Evaluation evaluation = new Evaluation();
            evaluation.setSoutenance(soutenance);
            evaluation.setEvaluateur(evaluateur);
            evaluation.setCritere(cn.getCritere());
            evaluation.setNote(cn.getNote());
            evaluation.setCommentaire(cn.getCommentaire());
            return evaluation;
        }).toList();

        return evaluationRepository.saveAll(evaluations).stream().map(EvaluationResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> lister(Long soutenanceId) {
        Soutenance soutenance = soutenanceService.getEntite(soutenanceId);
        return evaluationRepository.findBySoutenanceOrderByDateEvaluationAsc(soutenance)
                .stream().map(EvaluationResponse::new).toList();
    }

    @Transactional
    public SoutenanceResponse finaliser(Long soutenanceId) {
        Soutenance soutenance = soutenanceService.getEntite(soutenanceId);
        List<Evaluation> evaluations = evaluationRepository.findBySoutenanceOrderByDateEvaluationAsc(soutenance);

        Set<Role> rolesPresents = evaluations.stream()
                .map(e -> e.getEvaluateur().getRole())
                .collect(java.util.stream.Collectors.toSet());

        if (!rolesPresents.contains(Role.ENSEIGNANT) || !rolesPresents.contains(Role.ENTREPRISE)) {
            throw new ConflictException("Il manque l'évaluation de l'enseignant ou de l'entreprise pour finaliser.");
        }

        float noteFinale = (float) evaluations.stream().mapToDouble(Evaluation::getNote).average().orElse(0);

        Stage stage = soutenance.getStage();
        stage.setNoteFinale(noteFinale);
        stage.setStatut(StatutStage.TERMINE);

        byte[] pdf = attestationService.genererPdf(stage);
        stage.setAttestationFilename(fileStorageService.storeGeneratedPdf(pdf));

        stageRepository.save(stage);

        soutenance.setStatut(StatutSoutenance.REALISEE);
        soutenanceRepository.save(soutenance);

        notificationService.creer(stage.getConvention().getCandidature().getEtudiant(), TypeNotification.EVALUATION,
                "Note finale disponible",
                "Votre note finale est de " + noteFinale + "/20. Votre attestation est téléchargeable.",
                "/app/etudiant/stage");

        return new SoutenanceResponse(soutenance);
    }
}
