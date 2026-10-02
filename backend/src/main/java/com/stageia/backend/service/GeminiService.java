package com.stageia.backend.service;

import com.stageia.backend.dto.gemini.GeminiContent;
import com.stageia.backend.dto.gemini.GeminiGenerationConfig;
import com.stageia.backend.dto.gemini.GeminiPart;
import com.stageia.backend.dto.gemini.GeminiRequest;
import com.stageia.backend.dto.gemini.GeminiResponse;
import com.stageia.backend.dto.gemini.GeminiSystemInstruction;
import com.stageia.backend.exception.IAServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

/**
 * Point d'accès unique à l'API Google Gemini (tier gratuit). Aucune autre classe
 * du projet ne doit appeler l'API IA directement — cela garde le fournisseur
 * remplaçable (cf. rapport, section 6.3) et centralise la gestion des erreurs.
 */
@Service
public class GeminiService {

    private final RestClient restClient;
    private final String model;

    public GeminiService(@Value("${gemini.api-key}") String apiKey,
                          @Value("${gemini.model}") String model) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader("content-type", "application/json")
                .build();
    }

    private static final int MAX_TENTATIVES = 3;
    private static final long DELAI_ENTRE_TENTATIVES_MS = 3000;

    public String demander(String systemPrompt, String message) {
        GeminiRequest request = new GeminiRequest(
                new GeminiSystemInstruction(systemPrompt),
                List.of(new GeminiContent("user", List.of(new GeminiPart(message)))),
                new GeminiGenerationConfig(1024)
        );

        RestClientException derniereErreur = null;

        for (int tentative = 1; tentative <= MAX_TENTATIVES; tentative++) {
            try {
                GeminiResponse response = restClient.post()
                        .uri("/models/{model}:generateContent", model)
                        .body(request)
                        .retrieve()
                        .body(GeminiResponse.class);

                if (response == null) {
                    throw new IAServiceException("Réponse vide de l'API Gemini.", null);
                }
                return response.firstText();
            } catch (HttpServerErrorException.ServiceUnavailable e) {
                // Le tier gratuit de Gemini subit parfois des pics de charge temporaires (503) :
                // une courte nouvelle tentative suffit généralement, inutile de faire échouer l'analyse.
                derniereErreur = e;
                attendreAvantNouvelleTentative(tentative);
            } catch (RestClientException e) {
                throw new IAServiceException("Échec de l'appel à l'API Gemini : " + e.getMessage(), e);
            }
        }

        throw new IAServiceException("Échec de l'appel à l'API Gemini après " + MAX_TENTATIVES
                + " tentatives (modèle surchargé) : " + derniereErreur.getMessage(), derniereErreur);
    }

    private void attendreAvantNouvelleTentative(int tentative) {
        try {
            Thread.sleep(DELAI_ENTRE_TENTATIVES_MS * tentative);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
