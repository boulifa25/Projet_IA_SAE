package com.stageia.backend.repository;

import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Convention;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Soutenance;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.StatutOffre;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test de non-régression pour l'incident 8.4 du rapport final : le champ
 * Soutenance.jury est mappé en FetchType.EAGER dans l'entité, mais l'ajout d'un
 * @EntityGraph sur SoutenanceRepository.findByStage_Id (pour corriger un autre N+1)
 * avait pour effet de bord documenté de repasser silencieusement "jury" en LAZY — car
 * le type FETCH par défaut d'un @EntityGraph force toutes les associations non listées
 * explicitement à redevenir LAZY. Ce test détache l'entité de la session avant de lire
 * jury, ce qui aurait levé une LazyInitializationException si la régression revenait.
 */
@DataJpaTest
class SoutenanceRepositoryTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private SoutenanceRepository soutenanceRepository;

    @Test
    void findByStage_Id_chargeLeJuryMemeApresDetachementDeLaSession() {
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

        Offre offre = new Offre();
        offre.setTitre("Développeur Full-Stack");
        offre.setDescription("Stage de développement web");
        offre.setStatut(StatutOffre.PUBLIEE);
        offre.setEntreprise(entreprise);
        entityManager.persist(offre);

        Candidature candidature = new Candidature();
        candidature.setOffre(offre);
        candidature.setEtudiant(etudiant);
        candidature.setLettreMotivation("Lettre de motivation");
        candidature.setCvFilename("cv.pdf");
        candidature.setCvOriginalName("cv.pdf");
        entityManager.persist(candidature);

        Convention convention = new Convention();
        convention.setReference("CONV-2026-0001");
        convention.setCandidature(candidature);
        convention.setDateDebut(LocalDate.now());
        convention.setDateFin(LocalDate.now().plusMonths(6));
        entityManager.persist(convention);

        Stage stage = new Stage();
        stage.setConvention(convention);
        stage.setDateDebut(LocalDate.now());
        stage.setDateFin(LocalDate.now().plusMonths(6));
        entityManager.persist(stage);

        Soutenance soutenance = new Soutenance();
        soutenance.setStage(stage);
        soutenance.setDateSoutenance(Instant.now());
        soutenance.setLieuOuLien("Salle B204");
        soutenance.setJury(List.of("sara zouari", "Google"));
        entityManager.persist(soutenance);

        entityManager.flush();
        entityManager.clear(); // détache tout le monde, comme entre deux requêtes HTTP

        Optional<Soutenance> trouvee = soutenanceRepository.findByStage_Id(stage.getId());

        assertThat(trouvee).isPresent();
        // Avant correctif : cette ligne levait LazyInitializationException ("no session").
        assertThat(trouvee.get().getJury()).containsExactlyInAnyOrder("sara zouari", "Google");
    }
}
