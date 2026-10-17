package com.stageia.backend.repository;

import com.stageia.backend.model.Convention;
import com.stageia.backend.model.Enseignant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConventionRepository extends JpaRepository<Convention, Long> {

    String GRAPH = "candidature.etudiant";
    String GRAPH2 = "candidature.offre.entreprise";

    @EntityGraph(attributePaths = {GRAPH, GRAPH2, "enseignant"})
    List<Convention> findByValideeParEnseignantFalseOrderByDateGenerationDesc();

    @EntityGraph(attributePaths = {GRAPH, GRAPH2, "enseignant"})
    List<Convention> findByValideeParEnseignantTrueAndValideeParAdminFalseOrderByDateGenerationDesc();

    @EntityGraph(attributePaths = {GRAPH, GRAPH2, "enseignant"})
    List<Convention> findByEnseignantOrderByDateGenerationDesc(Enseignant enseignant);

    @EntityGraph(attributePaths = {GRAPH, GRAPH2, "enseignant"})
    List<Convention> findByCandidature_Etudiant_IdOrderByDateGenerationDesc(Long etudiantId);

    @EntityGraph(attributePaths = {GRAPH, GRAPH2, "enseignant"})
    java.util.Optional<Convention> findFirstByCandidature_Etudiant_IdOrderByDateGenerationDesc(Long etudiantId);

    long countByReferenceStartingWith(String prefix);
}
