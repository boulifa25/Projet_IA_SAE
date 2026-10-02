package com.stageia.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "etudiants")
@Getter
@Setter
@NoArgsConstructor
public class Etudiant extends Utilisateur {

    private String matricule;

    private String filiere;

    private String promotion;

    @Column(name = "cv_path")
    private String cvPath;
}
