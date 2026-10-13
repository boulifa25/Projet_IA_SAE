package com.stageia.backend.repository;

import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Offre;
import com.stageia.backend.model.StatutOffre;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OffreRepository extends JpaRepository<Offre, Long> {

    @EntityGraph(attributePaths = {"entreprise", "competencesRequises"})
    List<Offre> findByStatutOrderByDateCreationDesc(StatutOffre statut);

    @EntityGraph(attributePaths = {"entreprise", "competencesRequises"})
    List<Offre> findByEntrepriseOrderByDateCreationDesc(Entreprise entreprise);

    @EntityGraph(attributePaths = {"entreprise", "competencesRequises"})
    List<Offre> findAllByOrderByDateCreationDesc();
}
