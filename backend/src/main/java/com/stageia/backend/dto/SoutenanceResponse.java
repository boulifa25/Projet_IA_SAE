package com.stageia.backend.dto;

import com.stageia.backend.model.Soutenance;
import com.stageia.backend.model.StatutSoutenance;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
public class SoutenanceResponse {

    private final Long id;
    private final Long stageId;
    private final Instant dateSoutenance;
    private final String lieuOuLien;
    private final List<String> jury;
    private final StatutSoutenance statut;
    private final String etudiantNom;
    private final String etudiantPrenom;
    private final String entrepriseNom;
    private final Float noteFinale;
    private final boolean attestationDisponible;

    public SoutenanceResponse(Soutenance soutenance) {
        this.id = soutenance.getId();
        this.stageId = soutenance.getStage().getId();
        this.dateSoutenance = soutenance.getDateSoutenance();
        this.lieuOuLien = soutenance.getLieuOuLien();
        this.jury = soutenance.getJury();
        this.statut = soutenance.getStatut();
        this.etudiantNom = soutenance.getStage().getConvention().getCandidature().getEtudiant().getNom();
        this.etudiantPrenom = soutenance.getStage().getConvention().getCandidature().getEtudiant().getPrenom();
        this.entrepriseNom = soutenance.getStage().getConvention().getCandidature().getOffre().getEntreprise().getRaisonSociale();
        this.noteFinale = soutenance.getStage().getNoteFinale();
        this.attestationDisponible = soutenance.getStage().getAttestationFilename() != null;
    }
}
