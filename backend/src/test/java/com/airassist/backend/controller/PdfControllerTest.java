package com.airassist.backend.controller;

import com.airassist.backend.service.PdfService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PdfControllerTest {

    @Mock
    private PdfService pdfService;

    @InjectMocks
    private PdfController pdfController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void generatePdf_ShouldReturnPdfResponse() throws Exception {
        String template = "testTemplate";
        Map<String, Object> data = new HashMap<>();
        byte[] pdfBytes = new byte[]{1, 2, 3};

        when(pdfService.generatePdf(template, data)).thenReturn(pdfBytes);

        ResponseEntity<byte[]> response = pdfController.generatePdf(template, data);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertArrayEquals(pdfBytes, response.getBody());
        assertTrue(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).contains("contract.pdf"));
        verify(pdfService).generatePdf(template, data);
    }

    @Test
    void generatePdf_WhenPdfServiceThrowsIOException_ShouldPropagate() throws Exception {
        String template = "testTemplate";
        Map<String, Object> data = new HashMap<>();

        when(pdfService.generatePdf(template, data)).thenThrow(new IOException("fail"));

        assertThrows(IOException.class, () -> pdfController.generatePdf(template, data));
        verify(pdfService).generatePdf(template, data);
    }
}