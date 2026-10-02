package com.stageia.backend.repository;

import com.stageia.backend.model.Evaluation;
import com.stageia.backend.model.Soutenance;
import com.stageia.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findBySoutenanceOrderByDateEvaluationAsc(Soutenance soutenance);

    boolean existsBySoutenanceAndEvaluateur(Soutenance soutenance, Utilisateur evaluateur);
}
