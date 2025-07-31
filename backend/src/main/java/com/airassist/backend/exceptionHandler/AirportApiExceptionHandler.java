package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.AirportApiController;
import com.airassist.backend.exception.airport.InvalidAirportDetailsException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler for the Airport API.
 * Handles exceptions related to JSON processing and airport not found scenarios.
 */
@RestControllerAdvice(assignableTypes = AirportApiController.class)
public class AirportApiExceptionHandler {

    @ExceptionHandler(InvalidAirportDetailsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleAirportNotFound(InvalidAirportDetailsException ex) {
        return Map.of("error", ex.getMessage());
    }

    @ExceptionHandler(JsonProcessingException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleJsonProcessingException(JsonProcessingException ex) {
        return Map.of("error", "The server encountered an error while processing your request: " + ex.getMessage());
    }


}
