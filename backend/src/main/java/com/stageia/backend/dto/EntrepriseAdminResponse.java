package com.stageia.backend.dto;

import com.stageia.backend.model.Entreprise;
import lombok.Getter;

@Getter
public class EntrepriseAdminResponse {

    private final Long id;
    private final String raisonSociale;
    private final String secteur;
    private final String adresse;
    private final String email;
    private final long nombreOffresActives;
    private final long nombreCandidaturesRecues;
    private final long nombreEmbauches;

    public EntrepriseAdminResponse(Entreprise entreprise, long nombreOffresActives,
                                    long nombreCandidaturesRecues, long nombreEmbauches) {
        this.id = entreprise.getId();
        this.raisonSociale = entreprise.getRaisonSociale();
        this.secteur = entreprise.getSecteur();
        this.adresse = entreprise.getAdresse();
        this.email = entreprise.getEmail();
        this.nombreOffresActives = nombreOffresActives;
        this.nombreCandidaturesRecues = nombreCandidaturesRecues;
        this.nombreEmbauches = nombreEmbauches;
    }
}
