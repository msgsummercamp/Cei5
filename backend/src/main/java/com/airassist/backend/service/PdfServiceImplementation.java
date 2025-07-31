package com.airassist.backend.service;

import com.airassist.backend.exception.FontNotFoundException;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Map;

@Service
@AllArgsConstructor
public class PdfServiceImplementation implements PdfService {

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


        builder.useFont(() -> {
            InputStream fontStream = getClass().getClassLoader().getResourceAsStream("fonts/DejaVuSans.ttf");

            if (fontStream == null) {
                throw new FontNotFoundException();
            }
            return fontStream;
        }, "DejaVu Sans");

        builder.toStream(outputStream);
        builder.run();
        return outputStream.toByteArray();
    }
}
