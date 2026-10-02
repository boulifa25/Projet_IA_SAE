package com.stageia.backend.dto;

import com.stageia.backend.model.Role;
import com.stageia.backend.model.Utilisateur;
import lombok.Getter;

@Getter
public class UserResponse {

    private final Long id;
    private final String nom;
    private final String prenom;
    private final String email;
    private final Role role;

    public UserResponse(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.nom = utilisateur.getNom();
        this.prenom = utilisateur.getPrenom();
        this.email = utilisateur.getEmail();
        this.role = utilisateur.getRole();
    }
}
