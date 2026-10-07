package com.stageia.backend.repository;

import com.stageia.backend.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    List<Etudiant> findByFiliere(String filiere);
}
