package com.stageia.backend.service;

import com.stageia.backend.dto.NotificationResponse;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Notification;
import com.stageia.backend.model.TypeNotification;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void creer(Utilisateur destinataire, TypeNotification type, String titre, String message, String lien) {
        Notification notification = new Notification();
        notification.setDestinataire(destinataire);
        notification.setType(type);
        notification.setTitre(titre);
        notification.setMessage(message);
        notification.setLien(lien);
        notificationRepository.save(notification);
    }

    @Transactional
    public void creerPourPlusieurs(List<? extends Utilisateur> destinataires, TypeNotification type, String titre, String message, String lien) {
        destinataires.forEach(d -> creer(d, type, titre, message, lien));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listerPourUtilisateur(Utilisateur utilisateur) {
        return notificationRepository.findTop50ByDestinataireOrderByDateCreationDesc(utilisateur)
                .stream().map(NotificationResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> compterNonLues(Utilisateur utilisateur) {
        return Map.of("count", notificationRepository.countByDestinataireAndLuFalse(utilisateur));
    }

    @Transactional
    public NotificationResponse marquerCommeLue(Long id, Utilisateur utilisateur) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable : " + id));

        if (!notification.getDestinataire().getId().equals(utilisateur.getId())) {
            throw new AccessDeniedException("Cette notification ne vous appartient pas.");
        }

        notification.setLu(true);
        return new NotificationResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void marquerToutesCommeLues(Utilisateur utilisateur) {
        List<Notification> nonLues = notificationRepository.findByDestinataireAndLuFalse(utilisateur);
        nonLues.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(nonLues);
    }
}
