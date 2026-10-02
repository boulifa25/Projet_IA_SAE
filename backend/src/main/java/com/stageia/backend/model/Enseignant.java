package com.stageia.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "enseignants")
@Getter
@Setter
@NoArgsConstructor
public class Enseignant extends Utilisateur {

    private String departement;

    private String specialite;
}
