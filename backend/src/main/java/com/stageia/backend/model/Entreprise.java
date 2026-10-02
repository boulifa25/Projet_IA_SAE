package com.stageia.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "entreprises")
@Getter
@Setter
@NoArgsConstructor
public class Entreprise extends Utilisateur {

    @Column(name = "raison_sociale")
    private String raisonSociale;

    private String secteur;

    private String adresse;
}
