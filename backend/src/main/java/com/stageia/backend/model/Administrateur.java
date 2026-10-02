package com.stageia.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "administrateurs")
@Getter
@Setter
@NoArgsConstructor
public class Administrateur extends Utilisateur {

    @Column(name = "niveau_acces")
    private int niveauAcces = 1;
}
