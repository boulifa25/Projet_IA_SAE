package com.stageia.backend.dto;

import com.stageia.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;

    @NotNull
    private Role role;

    // Champs spécifiques Étudiant
    private String matricule;
    private String filiere;
    private String promotion;

    // Champs spécifiques Enseignant
    private String departement;
    private String specialite;

    // Champs spécifiques Entreprise
    private String raisonSociale;
    private String secteur;
    private String adresse;
}
