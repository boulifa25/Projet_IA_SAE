package com.stageia.backend.repository;

import com.stageia.backend.model.Convention;
import com.stageia.backend.model.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConventionRepository extends JpaRepository<Convention, Long> {

    List<Convention> findByValideeParEnseignantFalseOrderByDateGenerationDesc();

    List<Convention> findByValideeParEnseignantTrueAndValideeParAdminFalseOrderByDateGenerationDesc();

    List<Convention> findByEnseignantOrderByDateGenerationDesc(Enseignant enseignant);

    List<Convention> findByCandidature_Etudiant_IdOrderByDateGenerationDesc(Long etudiantId);

    long countByReferenceStartingWith(String prefix);
}
