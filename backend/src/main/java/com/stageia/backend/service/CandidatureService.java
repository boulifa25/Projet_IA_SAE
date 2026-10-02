package com.stageia.backend.service;

import com.stageia.backend.dto.CandidatureResponse;
import com.stageia.backend.exception.ConflictException;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.StatutCandidature;
import com.stageia.backend.model.StatutOffre;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.CandidatureRepository;
import com.stageia.backend.repository.OffreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final OffreRepository offreRepository;
    private final FileStorageService fileStorageService;
    private final ConventionService conventionService;

    @Transactional
    public CandidatureResponse postuler(Long offreId, String lettreMotivation, MultipartFile cv, Etudiant etudiant) {
        Offre offre = offreRepository.findById(offreId)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable : " + offreId));

        if (offre.getStatut() != StatutOffre.PUBLIEE) {
            throw new ConflictException("Cette offre n'est plus ouverte aux candidatures.");
        }

        candidatureRepository.findByOffreAndEtudiant(offre, etudiant).ifPresent(existing -> {
            throw new ConflictException("Vous avez déjà postulé à cette offre.");
        });

        String cvFilename = fileStorageService.storePdf(cv);

        Candidature candidature = new Candidature();
        candidature.setOffre(offre);
        candidature.setEtudiant(etudiant);
        candidature.setLettreMotivation(lettreMotivation);
        candidature.setCvFilename(cvFilename);
        candidature.setCvOriginalName(cv.getOriginalFilename());
        candidature.setStatut(StatutCandidature.EN_ATTENTE);

        return new CandidatureResponse(candidatureRepository.save(candidature));
    }

    @Transactional(readOnly = true)
    public List<CandidatureResponse> listerMesCandidatures(Etudiant etudiant) {
        return candidatureRepository.findByEtudiantOrderByDateEnvoiDesc(etudiant)
                .stream().map(CandidatureResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<CandidatureResponse> listerRecues(Entreprise entreprise) {
        return candidatureRepository.findByOffre_EntrepriseOrderByDateEnvoiDesc(entreprise)
                .stream().map(CandidatureResponse::new).toList();
    }

    @Transactional
    public CandidatureResponse changerStatut(Long candidatureId, StatutCandidature nouveauStatut, Entreprise entreprise) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable : " + candidatureId));

        if (!candidature.getOffre().getEntreprise().getId().equals(entreprise.getId())) {
            throw new AccessDeniedException("Cette candidature ne concerne pas une de vos offres.");
        }

        boolean vientDetreAcceptee = nouveauStatut == StatutCandidature.ACCEPTEE
                && candidature.getStatut() != StatutCandidature.ACCEPTEE;

        candidature.setStatut(nouveauStatut);
        Candidature saved = candidatureRepository.save(candidature);

        if (vientDetreAcceptee) {
            conventionService.genererPourCandidature(saved);
        }

        return new CandidatureResponse(saved);
    }

    @Transactional(readOnly = true)
    public Resource getCv(Long candidatureId, Utilisateur utilisateur) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable : " + candidatureId));

        boolean estEtudiantProprietaire = candidature.getEtudiant().getId().equals(utilisateur.getId());
        boolean estEntrepriseProprietaire = candidature.getOffre().getEntreprise().getId().equals(utilisateur.getId());
        boolean estAdmin = utilisateur.getRole() == Role.ADMINISTRATEUR;

        if (!estEtudiantProprietaire && !estEntrepriseProprietaire && !estAdmin) {
            throw new AccessDeniedException("Vous n'avez pas accès à ce document.");
        }

        return fileStorageService.load(candidature.getCvFilename());
    }

    @Transactional(readOnly = true)
    public String getCvOriginalName(Long candidatureId) {
        return candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable : " + candidatureId))
                .getCvOriginalName();
    }
}
