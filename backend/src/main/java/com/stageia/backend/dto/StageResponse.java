package com.stageia.backend.dto;

import com.stageia.backend.model.Stage;
import com.stageia.backend.model.StatutStage;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class StageResponse {

    private final Long id;
    private final Long conventionId;
    private final String sujet;
    private final LocalDate dateDebut;
    private final LocalDate dateFin;
    private final StatutStage statut;
    private final String etudiantNom;
    private final String etudiantPrenom;
    private final String entrepriseNom;
    private final String enseignantNom;
    private final long nombreRapports;

    public StageResponse(Stage stage, long nombreRapports) {
        this.id = stage.getId();
        this.conventionId = stage.getConvention().getId();
        this.sujet = stage.getConvention().getSujet();
        this.dateDebut = stage.getDateDebut();
        this.dateFin = stage.getDateFin();
        this.statut = stage.getStatut();
        this.etudiantNom = stage.getConvention().getCandidature().getEtudiant().getNom();
        this.etudiantPrenom = stage.getConvention().getCandidature().getEtudiant().getPrenom();
        this.entrepriseNom = stage.getConvention().getCandidature().getOffre().getEntreprise().getRaisonSociale();
        this.enseignantNom = stage.getConvention().getEnseignant() != null
                ? stage.getConvention().getEnseignant().getPrenom() + " " + stage.getConvention().getEnseignant().getNom()
                : null;
        this.nombreRapports = nombreRapports;
    }
}
