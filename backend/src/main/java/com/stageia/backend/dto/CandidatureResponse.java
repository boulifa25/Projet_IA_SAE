package com.stageia.backend.dto;

import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.StatutCandidature;
import lombok.Getter;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

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
    private final Integer scoreIa;
    private final List<String> scoreIaPointsForts;
    private final List<String> scoreIaPointsAmeliorer;
    private final String scoreIaConseil;

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
        this.scoreIa = candidature.getScoreIa();
        this.scoreIaPointsForts = splitLignes(candidature.getScoreIaPointsForts());
        this.scoreIaPointsAmeliorer = splitLignes(candidature.getScoreIaPointsAmeliorer());
        this.scoreIaConseil = candidature.getScoreIaConseil();
    }

    private static List<String> splitLignes(String texte) {
        if (texte == null || texte.isBlank()) {
            return List.of();
        }
        return Arrays.asList(texte.split("\n"));
    }
}
