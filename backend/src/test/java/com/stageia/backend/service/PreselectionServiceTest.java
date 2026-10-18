package com.stageia.backend.service;

import com.stageia.backend.dto.ia.CandidaturePreselectionResultat;
import com.stageia.backend.exception.IAServiceException;
import com.stageia.backend.model.Candidature;
import com.stageia.backend.model.Entreprise;
import com.stageia.backend.model.Etudiant;
import com.stageia.backend.model.Offre;
import com.stageia.backend.repository.CandidatureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Tests de non-régression pour l'incident documenté en section 8.5 du rapport final :
 * le modèle Groq (gpt-oss-120b, "reasoning model") peut renvoyer une réponse JSON
 * tronquée ou mal formée. PreselectionService doit alors lever une IAServiceException
 * gérée plutôt que de laisser remonter une exception brute de parsing.
 */
@ExtendWith(MockitoExtension.class)
class PreselectionServiceTest {

    @Mock
    private OffreService offreService;
    @Mock
    private CandidatureRepository candidatureRepository;
    @Mock
    private LlmService llmService;

    private PreselectionService preselectionService;

    private Offre offre;
    private Entreprise entreprise;
    private Candidature candidature;

    @BeforeEach
    void setUp() {
        preselectionService = new PreselectionService(offreService, candidatureRepository, llmService, new ObjectMapper());

        entreprise = new Entreprise();
        entreprise.setId(1L);

        offre = new Offre();
        offre.setId(10L);
        offre.setTitre("Développeur Full-Stack");
        offre.setDescription("Stage de développement web");

        Etudiant etudiant = new Etudiant();
        etudiant.setId(100L);
        etudiant.setNom("Boulifa");
        etudiant.setPrenom("Aziz");

        candidature = new Candidature();
        candidature.setId(1000L);
        candidature.setOffre(offre);
        candidature.setEtudiant(etudiant);
        candidature.setLettreMotivation("Je suis très motivé par ce stage.");

        when(offreService.getOwnedOffre(10L, entreprise)).thenReturn(offre);
    }

    @Test
    void renvoieIAServiceException_quandLaReponseGroqEstUnJsonMalFormé() {
        when(candidatureRepository.findByOffreOrderByDateEnvoiDesc(offre)).thenReturn(List.of(candidature));
        // Réponse tronquée telle qu'observée réellement lors de l'incident 8.5
        // (le modèle "reasoning" consomme son budget de tokens avant de finir le JSON).
        when(llmService.demander(anyString(), anyString())).thenReturn("[{\"candidatureId\": 1000, \"score\": 85, \"rai");

        assertThatThrownBy(() -> preselectionService.calculerPreselection(10L, entreprise))
                .isInstanceOf(IAServiceException.class)
                .hasMessageContaining("réponse invalide");
    }

    @Test
    void renvoieIAServiceException_quandLaReponseNEstPasDuJsonDuTout() {
        when(candidatureRepository.findByOffreOrderByDateEnvoiDesc(offre)).thenReturn(List.of(candidature));
        when(llmService.demander(anyString(), anyString()))
                .thenReturn("Désolé, je ne peux pas évaluer ces candidatures pour le moment.");

        assertThatThrownBy(() -> preselectionService.calculerPreselection(10L, entreprise))
                .isInstanceOf(IAServiceException.class);
    }

    @Test
    void parseCorrectement_uneReponseJsonValide_memeEntreeDesBlocsMarkdown() {
        when(candidatureRepository.findByOffreOrderByDateEnvoiDesc(offre)).thenReturn(List.of(candidature));
        when(llmService.demander(anyString(), anyString())).thenReturn(
                "```json\n[{\"candidatureId\": 1000, \"score\": 85, \"raison\": \"Bon profil\"}]\n```");

        List<CandidaturePreselectionResultat> resultats = preselectionService.calculerPreselection(10L, entreprise);

        assertThat(resultats).hasSize(1);
        assertThat(resultats.get(0).candidatureId()).isEqualTo(1000L);
        assertThat(resultats.get(0).score()).isEqualTo(85);
    }

    @Test
    void neContactePasLeServiceIA_quandAucuneCandidatureNEstRecue() {
        when(candidatureRepository.findByOffreOrderByDateEnvoiDesc(offre)).thenReturn(List.of());

        List<CandidaturePreselectionResultat> resultats = preselectionService.calculerPreselection(10L, entreprise);

        assertThat(resultats).isEmpty();
    }
}
