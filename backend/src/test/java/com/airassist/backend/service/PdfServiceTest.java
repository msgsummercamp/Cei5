package com.airassist.backend.service;

import com.airassist.backend.service.impl.PdfServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
public class PdfServiceTest {

    @InjectMocks
    private PdfServiceImpl pdfService;

    @Mock
    private SpringTemplateEngine templateEngine;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void generatePdf_ShouldReturnPdfBytes()  {
        String template = "testTemplate";
        Map<String, Object> model = new HashMap<>();
        String html = "<html>test</html>";

        when(templateEngine.process(eq(template), any(Context.class))).thenReturn(html);

        PdfServiceImpl spyService = Mockito.spy(pdfService);
        byte[] result = spyService.generatePdf(template, model);

        assertNotNull(result);
    }

    @Test
    void generatePdf_WhenTemplateEngineFails_ShouldThrowException() {
        String template = "testTemplate";
        Map<String, Object> model = new HashMap<>();

        when(templateEngine.process(eq(template), any(Context.class))).thenThrow(new RuntimeException("fail"));

        assertThrows(RuntimeException.class, () -> pdfService.generatePdf(template, model));
    }
}