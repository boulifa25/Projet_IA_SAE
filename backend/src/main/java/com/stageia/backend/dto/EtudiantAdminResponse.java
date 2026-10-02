package com.stageia.backend.dto;

import com.stageia.backend.model.Etudiant;
import lombok.Getter;

@Getter
public class EtudiantAdminResponse {

    private final Long id;
    private final String nom;
    private final String prenom;
    private final String email;
    private final String matricule;
    private final String filiere;
    private final String promotion;
    private final String statutStage;
    private final String entrepriseNom;

    public EtudiantAdminResponse(Etudiant etudiant, String statutStage, String entrepriseNom) {
        this.id = etudiant.getId();
        this.nom = etudiant.getNom();
        this.prenom = etudiant.getPrenom();
        this.email = etudiant.getEmail();
        this.matricule = etudiant.getMatricule();
        this.filiere = etudiant.getFiliere();
        this.promotion = etudiant.getPromotion();
        this.statutStage = statutStage;
        this.entrepriseNom = entrepriseNom;
    }
}
