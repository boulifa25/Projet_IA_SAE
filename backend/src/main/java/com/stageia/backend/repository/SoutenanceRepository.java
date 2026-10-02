package com.stageia.backend.repository;

import com.stageia.backend.model.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {

    Optional<Soutenance> findByStage_Id(Long stageId);
}
