package com.stageia.backend.dto;

import com.stageia.backend.model.Offre;
import com.stageia.backend.model.StatutOffre;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
public class OffreResponse {

    private final Long id;
    private final String titre;
    private final String description;
    private final String filiere;
    private final String lieu;
    private final Integer dureeMois;
    private final LocalDate dateDebut;
    private final List<String> competencesRequises;
    private final StatutOffre statut;
    private final Long entrepriseId;
    private final String entrepriseNom;
    private final long nombreCandidatures;
    private final Instant dateCreation;

    public OffreResponse(Offre offre, long nombreCandidatures) {
        this.id = offre.getId();
        this.titre = offre.getTitre();
        this.description = offre.getDescription();
        this.filiere = offre.getFiliere();
        this.lieu = offre.getLieu();
        this.dureeMois = offre.getDureeMois();
        this.dateDebut = offre.getDateDebut();
        this.competencesRequises = offre.getCompetencesRequises();
        this.statut = offre.getStatut();
        this.entrepriseId = offre.getEntreprise().getId();
        this.entrepriseNom = offre.getEntreprise().getRaisonSociale();
        this.nombreCandidatures = nombreCandidatures;
        this.dateCreation = offre.getDateCreation();
    }
}
