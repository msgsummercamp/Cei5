package com.airassist.backend.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
@AllArgsConstructor
public class PdfServiceImpl implements PdfService {

    private final TemplateEngine templateEngine;

    @SneakyThrows
    @Override
    public byte[] generatePdf(String templateName, Map<String, Object> data) {
        Context context = new Context();
        context.setVariables(data);
        String htmlContent = templateEngine.process(templateName, context);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(htmlContent, null);

        builder.toStream(outputStream);
        builder.run();
        return outputStream.toByteArray();
    }
}
