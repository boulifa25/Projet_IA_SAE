package com.stageia.backend.service;

import com.stageia.backend.dto.AuthResponse;
import com.stageia.backend.dto.LoginRequest;
import com.stageia.backend.dto.RegisterRequest;
import com.stageia.backend.dto.UserResponse;
import com.stageia.backend.exception.EmailAlreadyExistsException;
import com.stageia.backend.exception.InvalidRegistrationException;
import com.stageia.backend.model.Enseignant;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Role;
import com.stageia.backend.model.Utilisateur;
import com.stageia.backend.repository.UtilisateurRepository;
import com.stageia.backend.security.JwtService;
import com.stageia.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        if (request.getRole() == Role.ADMINISTRATEUR) {
            throw new InvalidRegistrationException(
                    "La création d'un compte administrateur n'est pas autorisée via l'inscription publique.");
        }

        Utilisateur utilisateur = buildUtilisateur(request);
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getPassword()));
        utilisateur.setRole(request.getRole());

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, jwtService.getExpirationMs(), new UserResponse(saved));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable après authentification"));

        UserPrincipal principal = new UserPrincipal(utilisateur);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, jwtService.getExpirationMs(), new UserResponse(utilisateur));
    }

    private Utilisateur buildUtilisateur(RegisterRequest request) {
        return switch (request.getRole()) {
            case ETUDIANT -> {
                Etudiant etudiant = new Etudiant();
                etudiant.setMatricule(request.getMatricule());
                etudiant.setFiliere(request.getFiliere());
                etudiant.setPromotion(request.getPromotion());
                yield etudiant;
            }
            case ENSEIGNANT -> {
                Enseignant enseignant = new Enseignant();
                enseignant.setDepartement(request.getDepartement());
                enseignant.setSpecialite(request.getSpecialite());
                yield enseignant;
            }
            case ENTREPRISE -> {
                Entreprise entreprise = new Entreprise();
                entreprise.setRaisonSociale(request.getRaisonSociale());
                entreprise.setSecteur(request.getSecteur());
                entreprise.setAdresse(request.getAdresse());
                yield entreprise;
            }
            case ADMINISTRATEUR -> throw new InvalidRegistrationException(
                    "La création d'un compte administrateur n'est pas autorisée via l'inscription publique.");
        };
    }
}
