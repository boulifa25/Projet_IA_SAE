package com.stageia.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "recommandations_ia")
@Getter
@Setter
@NoArgsConstructor
public class RecommandationIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rapport_id")
    private Rapport rapport;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRecommandation type;

    @Lob
    @Column(nullable = false)
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_risque")
    private NiveauRisque niveauRisque;

    @Column(name = "date_generation", nullable = false, updatable = false)
    private Instant dateGeneration;

    @PrePersist
    protected void onCreate() {
        this.dateGeneration = Instant.now();
    }
}
