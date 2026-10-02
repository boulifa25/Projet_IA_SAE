package com.stageia.backend.dto;

import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.StatutCandidature;
import lombok.Getter;

import java.time.Instant;

@Getter
public class CandidatureResponse {

    private final Long id;
    private final Long offreId;
    private final String offreTitre;
    private final String entrepriseNom;
    private final Long etudiantId;
    private final String etudiantNom;
    private final String etudiantPrenom;
    private final String lettreMotivation;
    private final String cvOriginalName;
    private final StatutCandidature statut;
    private final Instant dateEnvoi;

    public CandidatureResponse(Candidature candidature) {
        this.id = candidature.getId();
        this.offreId = candidature.getOffre().getId();
        this.offreTitre = candidature.getOffre().getTitre();
        this.entrepriseNom = candidature.getOffre().getEntreprise().getRaisonSociale();
        this.etudiantId = candidature.getEtudiant().getId();
        this.etudiantNom = candidature.getEtudiant().getNom();
        this.etudiantPrenom = candidature.getEtudiant().getPrenom();
        this.lettreMotivation = candidature.getLettreMotivation();
        this.cvOriginalName = candidature.getCvOriginalName();
        this.statut = candidature.getStatut();
        this.dateEnvoi = candidature.getDateEnvoi();
    }
}
