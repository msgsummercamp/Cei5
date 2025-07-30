package com.airassist.backend.exception;

public class InvalidAirportDetailsException extends RuntimeException {
    public InvalidAirportDetailsException(String fromAirport, String toAirport) {
        super("Invalid airports details: from " + fromAirport + " to " + toAirport + ". Please check the airport codes.");
    }
}
