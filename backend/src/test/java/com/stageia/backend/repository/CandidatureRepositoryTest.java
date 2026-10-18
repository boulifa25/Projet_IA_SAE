package com.stageia.backend.repository;

import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.StatutOffre;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test de non-régression pour les incidents 8.2/8.3 du rapport final : les tableaux de
 * bord étaient lents à cause de requêtes N+1 (une requête SQL par association chargée
 * paresseusement). Le correctif a ajouté @EntityGraph sur les méthodes de repository
 * concernées. Ce test vérifie, via les statistiques Hibernate, qu'une seule requête SQL
 * est exécutée pour charger une liste de candidatures avec leurs associations
 * (étudiant, offre, entreprise) — et non une par ligne.
 */
@DataJpaTest
@ActiveProfiles("test")
class CandidatureRepositoryTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Test
    void findByEtudiant_IdOrderByDateEnvoiDesc_chargeToutesLesAssociationsEnUneSeuleRequete() {
        Entreprise entreprise = new Entreprise();
        entreprise.setNom("Google");
        entreprise.setPrenom("RH");
        entreprise.setEmail("rh@google.test");
        entreprise.setMotDePasse("hash");
        entreprise.setRole(Role.ENTREPRISE);
        entreprise.setRaisonSociale("Google");
        entityManager.persist(entreprise);

        Etudiant etudiant = new Etudiant();
        etudiant.setNom("Boulifa");
        etudiant.setPrenom("Aziz");
        etudiant.setEmail("aziz@test.fr");
        etudiant.setMotDePasse("hash");
        etudiant.setRole(Role.ETUDIANT);
        etudiant.setMatricule("M001");
        entityManager.persist(etudiant);

        for (int i = 0; i < 3; i++) {
            Offre offre = new Offre();
            offre.setTitre("Offre " + i);
            offre.setDescription("Description " + i);
            offre.setStatut(StatutOffre.PUBLIEE);
            offre.setEntreprise(entreprise);
            entityManager.persist(offre);

            Candidature candidature = new Candidature();
            candidature.setOffre(offre);
            candidature.setEtudiant(etudiant);
            candidature.setLettreMotivation("Lettre " + i);
            candidature.setCvFilename("cv" + i + ".pdf");
            candidature.setCvOriginalName("cv.pdf");
            entityManager.persist(candidature);
        }

        entityManager.flush();
        entityManager.clear(); // détache tout le monde, comme dans une vraie requête HTTP

        Statistics stats = entityManager.unwrap(Session.class).getSessionFactory().getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        List<Candidature> resultat = candidatureRepository.findByEtudiant_IdOrderByDateEnvoiDesc(etudiant.getId());

        // Accès aux associations normalement lazy : si l'EntityGraph a été retiré par
        // erreur, cet accès déclenchera des requêtes supplémentaires (N+1) comptées
        // ci-dessous, ou une LazyInitializationException si la session était fermée.
        for (Candidature c : resultat) {
            assertThat(c.getEtudiant().getNom()).isEqualTo("Boulifa");
            assertThat(c.getOffre().getEntreprise().getRaisonSociale()).isEqualTo("Google");
        }

        assertThat(resultat).hasSize(3);
        assertThat(stats.getPrepareStatementCount())
                .as("une seule requête SQL doit suffire grâce à @EntityGraph, pas une par candidature (N+1)")
                .isEqualTo(1);
    }
}
