package com.stageia.backend.service;

import com.stageia.backend.exception.InvalidFileException;
import com.stageia.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("application/pdf");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    private final Path root;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de créer le dossier d'upload", e);
        }
    }

    public String storePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Le CV est obligatoire.");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException("Le CV doit être un fichier PDF.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new InvalidFileException("Le CV ne doit pas dépasser 5 Mo.");
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (extension != null ? "." + extension : ".pdf");

        try {
            Files.copy(file.getInputStream(), root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible d'enregistrer le fichier.", e);
        }

        return filename;
    }

    public String storeGeneratedPdf(byte[] content) {
        String filename = UUID.randomUUID() + ".pdf";
        try {
            Files.write(root.resolve(filename), content);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible d'enregistrer le fichier généré.", e);
        }
        return filename;
    }

    public Resource load(String filename) {
        try {
            Path file = root.resolve(filename).normalize();
            if (!file.startsWith(root)) {
                throw new ResourceNotFoundException("Fichier introuvable : " + filename);
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("Fichier introuvable : " + filename);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Fichier introuvable : " + filename);
        }
    }
}
