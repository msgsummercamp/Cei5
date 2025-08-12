package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.PdfController;
import com.airassist.backend.model.enums.ApiErrorMessages;
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
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.PDF_GENERATION_ERROR.getCode());
    }
}
