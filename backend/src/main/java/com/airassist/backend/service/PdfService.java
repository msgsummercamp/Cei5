package com.airassist.backend.service;

import java.io.IOException;
import java.util.Map;

/**
 * Service interface for PDF generation.
 */
public interface PdfService {

    /**
     * Generates a PDF document from the specified HTML template and data.
     *
     * @param templateName the name of the HTML template to use
     * @param data a map containing the data to populate the template
     * @return a byte array representing the generated PDF document
     * @throws IOException if an error occurs during PDF generation
     */
    byte[] generatePdf(String templateName, Map<String, Object> data) throws IOException;
}
