package com.stageia.backend.repository;

import com.stageia.backend.model.Stage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StageRepository extends JpaRepository<Stage, Long> {

    Optional<Stage> findByConvention_Id(Long conventionId);

    @Query("SELECT COUNT(DISTINCT s.convention.candidature.etudiant.id) FROM Stage s")
    long countDistinctEtudiants();

    @EntityGraph(attributePaths = {"convention.candidature.offre.entreprise"})
    List<Stage> findByConvention_Candidature_Etudiant_IdOrderByDateCreationDesc(Long etudiantId);

    List<Stage> findByConvention_EnseignantOrderByDateCreationDesc(com.stageia.backend.model.Enseignant enseignant);

    List<Stage> findByConvention_Candidature_Offre_EntrepriseOrderByDateCreationDesc(com.stageia.backend.model.Entreprise entreprise);
}
