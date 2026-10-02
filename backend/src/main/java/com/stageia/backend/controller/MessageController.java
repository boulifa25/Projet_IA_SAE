package com.stageia.backend.controller;

import com.stageia.backend.dto.MessageRequest;
import com.stageia.backend.dto.MessageResponse;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> envoyer(@Valid @RequestBody MessageRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        MessageResponse response = messageService.envoyer(request.getStageId(), request.getContenu(), principal.getUtilisateur());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/stage/{stageId}")
    public List<MessageResponse> parStage(@PathVariable Long stageId, @AuthenticationPrincipal UserPrincipal principal) {
        return messageService.lister(stageId, principal.getUtilisateur());
    }
}
