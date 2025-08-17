package com.airassist.backend.controller;

import com.airassist.backend.service.PdfService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@AllArgsConstructor
public class PdfController {

    private final PdfService pdfService;

    /**
     * Generates a PDF document based on the provided template and data.
     *
     * @param templateName the name of the HTML template to use for PDF generation
     * @param data a map containing the data to populate the template
     * @return a ResponseEntity containing the generated PDF document as a byte array
     * @throws IOException if an error occurs during PDF generation
     */
    @PostMapping(value = "/generate", produces = "application/pdf")
    public ResponseEntity<byte[]> generatePdf(@RequestParam("template") String templateName,
                                              @RequestBody Map<String, Object> data) throws IOException {

        byte[] pdfContent = pdfService.generatePdf(templateName, data);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=contract.pdf");

        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }
}
