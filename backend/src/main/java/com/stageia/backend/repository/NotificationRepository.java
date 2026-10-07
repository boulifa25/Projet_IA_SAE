package com.stageia.backend.repository;

import com.stageia.backend.model.Notification;
import com.stageia.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByDestinataireOrderByDateCreationDesc(Utilisateur destinataire);

    long countByDestinataireAndLuFalse(Utilisateur destinataire);

    List<Notification> findByDestinataireAndLuFalse(Utilisateur destinataire);
}
