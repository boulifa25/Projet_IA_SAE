package com.stageia.backend.service;

import com.stageia.backend.model.Stage;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class AttestationService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] genererPdf(Stage stage) {
        var candidature = stage.getConvention().getCandidature();
        var etudiant = candidature.getEtudiant();
        var entreprise = candidature.getOffre().getEntreprise();
        var offre = candidature.getOffre();

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                float margin = 60;
                float y = 760;

                cs.beginText();
                cs.setFont(fontBold, 20);
                cs.newLineAtOffset(margin, y);
                cs.showText("ATTESTATION DE STAGE");
                cs.endText();
                y -= 50;

                cs.beginText();
                cs.setFont(fontRegular, 11);
                cs.newLineAtOffset(margin, y);

                String[] lines = {
                        "L'école StageÉcole atteste que :",
                        "",
                        etudiant.getPrenom() + " " + etudiant.getNom() + (etudiant.getMatricule() != null ? " (matricule " + etudiant.getMatricule() + ")" : ""),
                        "",
                        "a effectué un stage au sein de l'entreprise " + entreprise.getRaisonSociale() + ",",
                        "du " + DATE_FORMAT.format(stage.getDateDebut()) + " au " + DATE_FORMAT.format(stage.getDateFin()) + ",",
                        "sur le sujet : " + offre.getTitre() + ".",
                        "",
                };

                for (String line : lines) {
                    cs.showText(line);
                    cs.newLineAtOffset(0, -18);
                }

                if (stage.getNoteFinale() != null) {
                    cs.showText(String.format("Note finale obtenue : %.1f / 20", stage.getNoteFinale()));
                    cs.newLineAtOffset(0, -18);
                }

                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 9);
                cs.newLineAtOffset(margin, 80);
                cs.showText("Document généré automatiquement par la plateforme StageÉcole.");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de générer l'attestation.", e);
        }
    }
}
