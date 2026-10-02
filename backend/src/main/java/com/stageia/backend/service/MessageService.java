package com.stageia.backend.service;

import com.stageia.backend.dto.MessageResponse;
import com.stageia.backend.model.Message;
import com.stageia.backend.model.Stage;
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

    @Transactional
    public MessageResponse envoyer(Long stageId, String contenu, Utilisateur auteur) {
        Stage stage = stageService.getStageAccessible(stageId, auteur);

        Message message = new Message();
        message.setStage(stage);
        message.setAuteur(auteur);
        message.setContenu(contenu);

        return new MessageResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> lister(Long stageId, Utilisateur utilisateur) {
        Stage stage = stageService.getStageAccessible(stageId, utilisateur);
        return messageRepository.findByStageOrderByDateEnvoiAsc(stage)
                .stream().map(MessageResponse::new).toList();
    }
}
