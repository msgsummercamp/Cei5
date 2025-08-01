package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.PdfController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

/**
 * Handles exceptions related to PDF generation and font formatting.
 */
@RestControllerAdvice(assignableTypes = PdfController.class)
public class PdfControllerExceptionHandler {

    @ExceptionHandler(IOException.class)
    public ResponseEntity<String> handleIOException(IOException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("The server encountered an error while generating pdf: " + ex.getMessage());
    }
}
