package com.airassist.backend.exception.airport;

public class InvalidAirportDetailsException extends RuntimeException {
    public InvalidAirportDetailsException(String departingAirportCode, String destinationAirportCode) {
        super("Invalid airports details: from " + departingAirportCode + " to " + destinationAirportCode + ". Please check the airport codes.");
    }
}
