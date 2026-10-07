package com.stageia.backend.service;

import com.stageia.backend.dto.OffreRequest;
import com.stageia.backend.dto.OffreResponse;
import com.stageia.backend.exception.ConflictException;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import com.stageia.backend.model.StatutOffre;
import com.stageia.backend.model.TypeNotification;
import com.stageia.backend.repository.CandidatureRepository;
import com.stageia.backend.repository.EtudiantRepository;
import com.stageia.backend.repository.OffreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OffreService {

    private final OffreRepository offreRepository;
    private final CandidatureRepository candidatureRepository;
    private final EtudiantRepository etudiantRepository;
    private final NotificationService notificationService;

    @Transactional
    public OffreResponse creer(OffreRequest request, Entreprise entreprise) {
        Offre offre = new Offre();
        appliquer(offre, request);
        offre.setEntreprise(entreprise);
        offre.setStatut(StatutOffre.BROUILLON);
        Offre saved = offreRepository.save(offre);
        return toResponse(saved);
    }

    @Transactional
    public OffreResponse modifier(Long id, OffreRequest request, Entreprise entreprise) {
        Offre offre = getOwnedOffre(id, entreprise);
        if (offre.getStatut() == StatutOffre.CLOTUREE) {
            throw new ConflictException("Impossible de modifier une offre clôturée.");
        }
        appliquer(offre, request);
        return toResponse(offreRepository.save(offre));
    }

    @Transactional
    public OffreResponse publier(Long id, Entreprise entreprise) {
        Offre offre = getOwnedOffre(id, entreprise);
        if (offre.getStatut() == StatutOffre.CLOTUREE) {
            throw new ConflictException("Impossible de publier une offre clôturée.");
        }
        offre.setStatut(StatutOffre.PUBLIEE);
        Offre saved = offreRepository.save(offre);

        if (saved.getFiliere() != null && !saved.getFiliere().isBlank()) {
            List<Etudiant> etudiantsConcernes = etudiantRepository.findByFiliere(saved.getFiliere());
            notificationService.creerPourPlusieurs(etudiantsConcernes, TypeNotification.OFFRE,
                    "Nouvelle offre dans votre filière",
                    saved.getEntreprise().getRaisonSociale() + " a publié \"" + saved.getTitre() + "\" pour la filière " + saved.getFiliere() + ".",
                    "/app/etudiant/offres");
        }

        return toResponse(saved);
    }

    @Transactional
    public OffreResponse cloturer(Long id, Entreprise entreprise) {
        Offre offre = getOwnedOffre(id, entreprise);
        offre.setStatut(StatutOffre.CLOTUREE);
        return toResponse(offreRepository.save(offre));
    }

    @Transactional(readOnly = true)
    public List<OffreResponse> listerToutes() {
        return offreRepository.findAll().stream()
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OffreResponse> listerPubliees() {
        return offreRepository.findByStatutOrderByDateCreationDesc(StatutOffre.PUBLIEE)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OffreResponse> listerMesOffres(Entreprise entreprise) {
        return offreRepository.findByEntrepriseOrderByDateCreationDesc(entreprise)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OffreResponse getDetail(Long id, com.stageia.backend.model.Utilisateur utilisateur) {
        Offre offre = offreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable : " + id));

        boolean estProprietaire = offre.getEntreprise().getId().equals(utilisateur.getId());
        boolean estAdmin = utilisateur.getRole() == com.stageia.backend.model.Role.ADMINISTRATEUR;

        if (offre.getStatut() != StatutOffre.PUBLIEE && !estProprietaire && !estAdmin) {
            throw new AccessDeniedException("Cette offre n'est pas accessible.");
        }

        return toResponse(offre);
    }

    Offre getOwnedOffre(Long id, Entreprise entreprise) {
        Offre offre = offreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable : " + id));
        if (!offre.getEntreprise().getId().equals(entreprise.getId())) {
            throw new AccessDeniedException("Cette offre ne vous appartient pas.");
        }
        return offre;
    }

    private void appliquer(Offre offre, OffreRequest request) {
        offre.setTitre(request.getTitre());
        offre.setDescription(request.getDescription());
        offre.setFiliere(request.getFiliere());
        offre.setLieu(request.getLieu());
        offre.setDureeMois(request.getDureeMois());
        offre.setDateDebut(request.getDateDebut());
        offre.setCompetencesRequises(request.getCompetencesRequises() != null ? request.getCompetencesRequises() : List.of());
    }

    private OffreResponse toResponse(Offre offre) {
        return new OffreResponse(offre, candidatureRepository.countByOffre(offre));
    }
}
