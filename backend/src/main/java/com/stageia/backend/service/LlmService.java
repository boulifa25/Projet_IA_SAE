package com.stageia.backend.service;

import com.stageia.backend.dto.groq.GroqMessage;
import com.stageia.backend.dto.groq.GroqRequest;
import com.stageia.backend.dto.groq.GroqResponse;
import com.stageia.backend.dto.ia.ConversationMessage;
import com.stageia.backend.exception.IAServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;

/**
 * Point d'accès unique au fournisseur IA (Groq, tier gratuit). Aucune autre classe
 * du projet ne doit appeler l'API IA directement — cela garde le fournisseur
 * remplaçable (cf. rapport, section 6.3) et centralise la gestion des erreurs.
 */
@Service
public class LlmService {

    private static final int MAX_TENTATIVES = 3;
    private static final long DELAI_ENTRE_TENTATIVES_MS = 3000;

    private final RestClient restClient;
    private final String model;

    public LlmService(@Value("${groq.api-key}") String apiKey,
                       @Value("${groq.model}") String model) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("content-type", "application/json")
                .build();
    }

    /** Appel simple à une question unique (sans historique) — analyse de rapport, matching... */
    public String demander(String systemPrompt, String message) {
        return demanderAvecHistorique(systemPrompt, List.of(new ConversationMessage("user", message)));
    }

    /** Appel avec un historique de conversation multi-tours — utilisé par le chatbot. */
    public String demanderAvecHistorique(String systemPrompt, List<ConversationMessage> historique) {
        List<GroqMessage> messages = new ArrayList<>();
        messages.add(new GroqMessage("system", systemPrompt));
        historique.forEach(m -> messages.add(new GroqMessage(mapRole(m.role()), m.contenu())));

        GroqRequest request = new GroqRequest(model, messages, 1024);

        RestClientException derniereErreur = null;

        for (int tentative = 1; tentative <= MAX_TENTATIVES; tentative++) {
            try {
                GroqResponse response = restClient.post()
                        .uri("/chat/completions")
                        .body(request)
                        .retrieve()
                        .body(GroqResponse.class);

                if (response == null) {
                    throw new IAServiceException("Réponse vide de l'API Groq.", null);
                }
                return response.firstText();
            } catch (HttpServerErrorException.ServiceUnavailable e) {
                // Pic de charge temporaire côté fournisseur (503) : une courte nouvelle
                // tentative suffit généralement, inutile de faire échouer l'appel.
                derniereErreur = e;
                attendreAvantNouvelleTentative(tentative);
            } catch (RestClientException e) {
                throw new IAServiceException("Échec de l'appel à l'API Groq : " + e.getMessage(), e);
            }
        }

        throw new IAServiceException("Échec de l'appel à l'API Groq après " + MAX_TENTATIVES
                + " tentatives (modèle surchargé) : " + derniereErreur.getMessage(), derniereErreur);
    }

    /** L'app utilise "model" pour une réponse IA (convention historique, indépendante du fournisseur) ;
     * Groq (API compatible OpenAI) attend "assistant". */
    private String mapRole(String appRole) {
        return "model".equals(appRole) ? "assistant" : appRole;
    }

    private void attendreAvantNouvelleTentative(int tentative) {
        try {
            Thread.sleep(DELAI_ENTRE_TENTATIVES_MS * tentative);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
