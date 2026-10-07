package com.stageia.backend.service;

import com.stageia.backend.dto.MessageResponse;
import com.stageia.backend.model.Message;
import com.stageia.backend.model.Stage;
import com.stageia.backend.model.TypeNotification;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final StageService stageService;
    private final NotificationService notificationService;

    @Transactional
    public MessageResponse envoyer(Long stageId, String contenu, Utilisateur auteur) {
        Stage stage = stageService.getStageAccessible(stageId, auteur);

        Message message = new Message();
        message.setStage(stage);
        message.setAuteur(auteur);
        message.setContenu(contenu);

        MessageResponse response = new MessageResponse(messageRepository.save(message));

        Utilisateur etudiant = stage.getConvention().getCandidature().getEtudiant();
        Utilisateur enseignant = stage.getConvention().getEnseignant();
        Utilisateur entreprise = stage.getConvention().getCandidature().getOffre().getEntreprise();

        List.of(etudiant, enseignant, entreprise).stream()
                .filter(u -> u != null && !u.getId().equals(auteur.getId()))
                .forEach(u -> notificationService.creer(u, TypeNotification.MESSAGE,
                        "Nouveau message de " + auteur.getPrenom() + " " + auteur.getNom(),
                        contenu.length() > 120 ? contenu.substring(0, 120) + "…" : contenu,
                        messagerieLienPour(u)));

        return response;
    }

    private String messagerieLienPour(Utilisateur destinataire) {
        return switch (destinataire.getRole()) {
            case ETUDIANT -> "/app/etudiant/messagerie";
            case ENSEIGNANT -> "/app/enseignant/messagerie";
            case ENTREPRISE -> "/app/entreprise/messagerie";
            case ADMINISTRATEUR -> "/app/admin";
        };
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> lister(Long stageId, Utilisateur utilisateur) {
        Stage stage = stageService.getStageAccessible(stageId, utilisateur);
        return messageRepository.findByStageOrderByDateEnvoiAsc(stage)
                .stream().map(MessageResponse::new).toList();
    }
}
