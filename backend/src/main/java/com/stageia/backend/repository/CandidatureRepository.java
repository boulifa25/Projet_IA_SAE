package com.stageia.backend.repository;

import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    @EntityGraph(attributePaths = {"etudiant", "offre.entreprise"})
    List<Candidature> findByEtudiant_IdOrderByDateEnvoiDesc(Long etudiantId);

    @EntityGraph(attributePaths = {"etudiant", "offre.entreprise"})
    List<Candidature> findByOffre_EntrepriseOrderByDateEnvoiDesc(Entreprise entreprise);

    @EntityGraph(attributePaths = {"etudiant", "offre.entreprise"})
    List<Candidature> findByOffreOrderByDateEnvoiDesc(Offre offre);

    Optional<Candidature> findByOffreAndEtudiant(Offre offre, Etudiant etudiant);

    long countByOffre(Offre offre);

    @Query("SELECT c.offre.id AS offreId, COUNT(c) AS total FROM Candidature c WHERE c.offre IN :offres GROUP BY c.offre.id")
    List<OffreCandidatureCount> countGroupedByOffre(@Param("offres") Collection<Offre> offres);

    interface OffreCandidatureCount {
        Long getOffreId();
        long getTotal();
    }
}
