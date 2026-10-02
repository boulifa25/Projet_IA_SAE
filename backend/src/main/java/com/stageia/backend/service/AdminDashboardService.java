package com.stageia.backend.service;

import com.stageia.backend.dto.DashboardStatsResponse;
import com.stageia.backend.dto.EntrepriseAdminResponse;
import com.stageia.backend.dto.EtudiantAdminResponse;
import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.StatutCandidature;
import com.stageia.backend.model.StatutOffre;
import com.stageia.backend.repository.CandidatureRepository;
import com.stageia.backend.repository.EntrepriseRepository;
import com.stageia.backend.repository.EtudiantRepository;
import com.stageia.backend.repository.OffreRepository;
import com.stageia.backend.repository.StageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OffreRepository offreRepository;
    private final CandidatureRepository candidatureRepository;
    private final EtudiantRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final StageRepository stageRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long offresActives = offreRepository.findAll().stream()
                .filter(o -> o.getStatut() == StatutOffre.PUBLIEE)
                .count();

        long candidaturesTotal = candidatureRepository.count();

        long etudiantsPlaces = stageRepository.findAll().stream()
                .map(s -> s.getConvention().getCandidature().getEtudiant().getId())
                .distinct()
                .count();

        long entreprisesPartenaires = entrepriseRepository.count();

        return new DashboardStatsResponse(offresActives, candidaturesTotal, etudiantsPlaces, entreprisesPartenaires);
    }

    @Transactional(readOnly = true)
    public List<EntrepriseAdminResponse> listerEntreprises() {
        return entrepriseRepository.findAll().stream()
                .map(entreprise -> {
                    List<Candidature> candidatures = candidatureRepository.findByOffre_EntrepriseOrderByDateEnvoiDesc(entreprise);
                    long offresActives = offreRepository.findByEntrepriseOrderByDateCreationDesc(entreprise).stream()
                            .filter(o -> o.getStatut() == StatutOffre.PUBLIEE)
                            .count();
                    long embauches = candidatures.stream()
                            .filter(c -> c.getStatut() == StatutCandidature.ACCEPTEE)
                            .count();
                    return new EntrepriseAdminResponse(entreprise, offresActives, candidatures.size(), embauches);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EtudiantAdminResponse> listerEtudiants() {
        return etudiantRepository.findAll().stream()
                .map(this::toEtudiantAdminResponse)
                .toList();
    }

    private EtudiantAdminResponse toEtudiantAdminResponse(Etudiant etudiant) {
        List<Stage> stages = stageRepository.findByConvention_Candidature_Etudiant_IdOrderByDateCreationDesc(etudiant.getId());

        if (stages.isEmpty()) {
            return new EtudiantAdminResponse(etudiant, "AUCUN", null);
        }

        Stage dernierStage = stages.get(0);
        String entrepriseNom = dernierStage.getConvention().getCandidature().getOffre().getEntreprise().getRaisonSociale();
        return new EtudiantAdminResponse(etudiant, dernierStage.getStatut().name(), entrepriseNom);
    }
}
