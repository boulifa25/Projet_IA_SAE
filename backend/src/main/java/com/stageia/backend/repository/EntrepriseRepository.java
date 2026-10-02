package com.stageia.backend.repository;

import com.stageia.backend.model.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
}
