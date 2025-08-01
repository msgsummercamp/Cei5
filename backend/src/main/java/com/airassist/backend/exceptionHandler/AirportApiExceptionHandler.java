package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.AirportApiController;
import com.airassist.backend.exception.airport.InvalidAirportDetailsException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handles exceptions related to JSON processing and airport not found scenarios.
 */
@RestControllerAdvice(assignableTypes = AirportApiController.class)
public class AirportApiExceptionHandler {

    @ExceptionHandler(InvalidAirportDetailsException.class)
    public ResponseEntity<String> handleAirportNotFound(InvalidAirportDetailsException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<String> handleJsonProcessingException(JsonProcessingException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("The server encountered an error while processing your request: " + ex.getMessage());
    }

    @ExceptionHandler(InterruptedException.class)
    public ResponseEntity<String> handleInterruptedException(InterruptedException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("The error was interrupted while fetching data: " + ex.getMessage());
    }
}
