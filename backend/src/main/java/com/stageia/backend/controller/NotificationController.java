package com.stageia.backend.controller;

import com.stageia.backend.dto.NotificationResponse;
import com.stageia.backend.security.UserPrincipal;
import com.stageia.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> lister(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.listerPourUtilisateur(principal.getUtilisateur());
    }

    @GetMapping("/non-lues")
    public Map<String, Long> nonLues(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.compterNonLues(principal.getUtilisateur());
    }

    @PostMapping("/{id}/lire")
    public NotificationResponse marquerCommeLue(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.marquerCommeLue(id, principal.getUtilisateur());
    }

    @PostMapping("/lire-tout")
    public void marquerToutesCommeLues(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.marquerToutesCommeLues(principal.getUtilisateur());
    }
}
