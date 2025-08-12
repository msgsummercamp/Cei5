package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.AirportApiController;
import com.airassist.backend.exception.airport.InvalidAirportDetailsException;
import com.airassist.backend.model.enums.ApiErrorMessages;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handles exceptions related to JSON processing and airport not found scenarios.
 */
@RestControllerAdvice(assignableTypes = AirportApiController.class)
public class AirportApiExceptionHandler {

    @ExceptionHandler(InvalidAirportDetailsException.class)
    public ProblemDetail handleAirportNotFound(InvalidAirportDetailsException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ProblemDetail handleJsonProcessingException(JsonProcessingException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.GENERIC_SERVER_ERROR.getCode());
    }

    @ExceptionHandler(InterruptedException.class)
    public ProblemDetail handleInterruptedException(InterruptedException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.SERVER_INTERRUPT_ERROR.getCode());
    }
}
