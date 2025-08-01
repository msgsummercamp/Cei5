package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.PdfController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.Map;

/**
 * Handles exceptions related to PDF generation and font formatting.
 */
@RestControllerAdvice(assignableTypes = PdfController.class)
public class PdfControllerExceptionHandler {

    @ExceptionHandler(IOException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleIOException(IOException ex) {
        return Map.of("error", "The server encountered an error while generating pdf: " + ex.getMessage());
    }
}
