package com.stageia.backend.config;

import com.stageia.backend.model.Administrateur;
import com.stageia.backend.model.Role;
import com.stageia.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crée un compte administrateur par défaut au premier démarrage,
 * car l'inscription publique n'autorise pas le rôle ADMINISTRATEUR (cf. AuthService).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed-email}")
    private String seedEmail;

    @Value("${app.admin.seed-password}")
    private String seedPassword;

    @Override
    public void run(String... args) {
        if (utilisateurRepository.existsByEmail(seedEmail)) {
            return;
        }

        Administrateur admin = new Administrateur();
        admin.setNom("Admin");
        admin.setPrenom("École");
        admin.setEmail(seedEmail);
        admin.setMotDePasse(passwordEncoder.encode(seedPassword));
        admin.setRole(Role.ADMINISTRATEUR);
        admin.setNiveauAcces(10);

        utilisateurRepository.save(admin);
        log.info("Compte administrateur créé : {}", seedEmail);
    }
}
