package com.stageia.backend.service;

import com.stageia.backend.dto.UserResponse;
import com.stageia.backend.exception.ResourceNotFoundException;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> listerTous() {
        return utilisateurRepository.findAll().stream().map(UserResponse::new).toList();
    }

    @Transactional
    public void reinitialiserMotDePasse(Long utilisateurId, String nouveauMotDePasse) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + utilisateurId));

        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);
    }
}
