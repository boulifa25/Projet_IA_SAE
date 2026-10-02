package com.stageia.backend.dto;

import com.stageia.backend.model.Convention;
import com.stageia.backend.model.StatutConvention;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
public class ConventionResponse {

    private final Long id;
    private final String reference;
    private final String sujet;
    private final LocalDate dateDebut;
    private final LocalDate dateFin;
    private final StatutConvention statut;
    private final boolean valideeParEnseignant;
    private final boolean valideeParAdmin;
    private final Long offreId;
    private final String offreTitre;
    private final String entrepriseNom;
    private final Long etudiantId;
    private final String etudiantNom;
    private final String etudiantPrenom;
    private final Long enseignantId;
    private final String enseignantNom;
    private final Instant dateGeneration;

    public ConventionResponse(Convention convention) {
        this.id = convention.getId();
        this.reference = convention.getReference();
        this.sujet = convention.getSujet();
        this.dateDebut = convention.getDateDebut();
        this.dateFin = convention.getDateFin();
        this.statut = convention.getStatut();
        this.valideeParEnseignant = convention.isValideeParEnseignant();
        this.valideeParAdmin = convention.isValideeParAdmin();
        this.offreId = convention.getCandidature().getOffre().getId();
        this.offreTitre = convention.getCandidature().getOffre().getTitre();
        this.entrepriseNom = convention.getCandidature().getOffre().getEntreprise().getRaisonSociale();
        this.etudiantId = convention.getCandidature().getEtudiant().getId();
        this.etudiantNom = convention.getCandidature().getEtudiant().getNom();
        this.etudiantPrenom = convention.getCandidature().getEtudiant().getPrenom();
        this.enseignantId = convention.getEnseignant() != null ? convention.getEnseignant().getId() : null;
        this.enseignantNom = convention.getEnseignant() != null
                ? convention.getEnseignant().getPrenom() + " " + convention.getEnseignant().getNom()
                : null;
        this.dateGeneration = convention.getDateGeneration();
    }
}
