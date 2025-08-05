package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.PdfController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

/**
 * Handles exceptions related to PDF generation and font formatting.
 */
@RestControllerAdvice(assignableTypes = PdfController.class)
public class PdfControllerExceptionHandler {

    @ExceptionHandler(IOException.class)
    public ProblemDetail handleIOException(IOException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "The server encountered an error while generating pdf: " + ex.getMessage());
    }
}
