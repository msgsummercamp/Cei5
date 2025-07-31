package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.PdfController;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.awt.*;
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

    @ExceptionHandler(FontFormatException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleFontFormatException(FontFormatException ex) {
        return Map.of("error", "The server encountered an error with the font format: " + ex.getMessage());
    }
}
