package com.airassist.backend.service;

import com.airassist.backend.model.Airport;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

/**
 * Service interface for fetching airport data from an external API.
 */
public interface AirportApiFetchService {
    /**
     * Fetches airport data from the API.
     *
     * @return A string containing the airport data in JSON format.
     */
    List<Airport> fetchAirportData() throws JsonProcessingException, InterruptedException;
}
