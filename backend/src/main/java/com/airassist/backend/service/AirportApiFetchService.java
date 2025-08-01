package com.airassist.backend.service;

import com.airassist.backend.model.Airport;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

/**
 * Service interface for fetching airport data from an external API.
 */
public interface AirportApiFetchService {

    /**
     * Fetches airport data from the external API.
     *
     * @return List of airports fetched from the API.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     * @throws InterruptedException If the thread is interrupted while fetching data.
     */
    List<Airport> fetchAirportData() throws JsonProcessingException, InterruptedException;

    /**
     * Fetches airport data from the external API.
     *
     * @return List of airports fetched from the API.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     * @throws InterruptedException If the thread is interrupted while fetching data.
     */
    List<Airport> fetchAirportDataInternal() throws JsonProcessingException, InterruptedException;
}
