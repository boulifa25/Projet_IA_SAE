package com.stageia.backend.repository;

import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    List<Candidature> findByEtudiantOrderByDateEnvoiDesc(Etudiant etudiant);

    List<Candidature> findByOffre_EntrepriseOrderByDateEnvoiDesc(Entreprise entreprise);

    List<Candidature> findByOffreOrderByDateEnvoiDesc(Offre offre);

    Optional<Candidature> findByOffreAndEtudiant(Offre offre, Etudiant etudiant);

    long countByOffre(Offre offre);
}
