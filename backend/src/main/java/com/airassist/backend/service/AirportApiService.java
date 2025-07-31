package com.airassist.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;

/**
 * Service class to interact with the Airport API for distance calculations and compensation levels.
 */
public interface AirportApiService {
    /**
     * Calculates the distance between two airports based on their IATA codes.
     *
     * @param departingAirportCode The IATA code.
     * @param destinationAirportCode   The IATA code.
     * @return The distance in kilometers between the two airports.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     */
    double getDistance(String departingAirportCode, String destinationAirportCode) throws JsonProcessingException;

    /**
     *
     * Calculates the compensation level based on the distance between two airports.
     *
     * @param distance The distance in kilometers between the two airports.
     * @return The compensation level based on the distance.
     */
    int calculateCompensation(double distance);
}
