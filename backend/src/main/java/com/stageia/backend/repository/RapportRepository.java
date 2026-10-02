package com.stageia.backend.repository;

import com.stageia.backend.model.Rapport;
import com.stageia.backend.model.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RapportRepository extends JpaRepository<Rapport, Long> {

    List<Rapport> findByStageOrderByDateDepotDesc(Stage stage);
}
