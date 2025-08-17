package com.airassist.backend.service.impl;

import com.airassist.backend.service.PdfService;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.sun.tools.javac.Main;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Map;
import java.util.Objects;

@Service
@AllArgsConstructor
public class PdfServiceImpl implements PdfService {

    private final TemplateEngine templateEngine;

    /**
     * Generates a PDF document from a Thymeleaf template and data.
     *
     * @param templateName the name of the Thymeleaf template
     * @param data the data to be used in the template
     * @return a byte array containing the generated PDF document
     */
    @SneakyThrows
    @Override
    public byte[] generatePdf(String templateName, Map<String, Object> data) {
        Context context = new Context();
        context.setVariables(data);
        String htmlContent = templateEngine.process(templateName, context);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.useFastMode()
                .useFont(new File(Objects.requireNonNull(Main.class.getClassLoader().getResource("fonts/DejaVuSans.ttf")).getFile()), "DejaVuSans")
                .withHtmlContent(htmlContent, null)
                .toStream(outputStream)
                .run();
        return outputStream.toByteArray();
    }
}
