package com.stageia.backend.controller;

import com.stageia.backend.dto.ChatbotRequest;
import com.stageia.backend.dto.ChatbotResponse;
import com.stageia.backend.dto.ia.ConversationMessage;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private static final int HISTORIQUE_MAX = 10;

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ChatbotResponse message(@Valid @RequestBody ChatbotRequest request,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        var historique = request.getHistorique().stream()
                .skip(Math.max(0, request.getHistorique().size() - HISTORIQUE_MAX))
                .map(m -> new ConversationMessage(m.getRole(), m.getContenu()))
                .toList();

        String reponse = chatbotService.repondre(request.getMessage(), historique, principal.getUtilisateur());
        return new ChatbotResponse(reponse);
    }
}
