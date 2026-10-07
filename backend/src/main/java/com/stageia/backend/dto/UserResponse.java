package com.stageia.backend.dto;

import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Utilisateur;
import lombok.Getter;

import java.time.Instant;

@Getter
public class UserResponse {

    private final Long id;
    private final String nom;
    private final String prenom;
    private final String email;
    private final Role role;
    private final Instant dateCreation;

    private String matricule;
    private String filiere;
    private String promotion;
    private String departement;
    private String specialite;
    private String raisonSociale;
    private String secteur;
    private String adresse;

    public UserResponse(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.nom = utilisateur.getNom();
        this.prenom = utilisateur.getPrenom();
        this.email = utilisateur.getEmail();
        this.role = utilisateur.getRole();
        this.dateCreation = utilisateur.getDateCreation();

        if (utilisateur instanceof Etudiant etudiant) {
            this.matricule = etudiant.getMatricule();
            this.filiere = etudiant.getFiliere();
            this.promotion = etudiant.getPromotion();
        } else if (utilisateur instanceof Enseignant enseignant) {
            this.departement = enseignant.getDepartement();
            this.specialite = enseignant.getSpecialite();
        } else if (utilisateur instanceof Entreprise entreprise) {
            this.raisonSociale = entreprise.getRaisonSociale();
            this.secteur = entreprise.getSecteur();
            this.adresse = entreprise.getAdresse();
        }
    }
}
