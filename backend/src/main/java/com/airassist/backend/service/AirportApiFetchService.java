package com.airassist.backend.service;

import com.airassist.backend.model.Airport;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

/**
 * Service interface for fetching airport data from an external API.
 */
public interface AirportApiFetchService {

    /**
     * Fetches airport data from database.
     *
     * @return List of airports.
     */
    List<Airport> getAirports();

    /**
     * Fetches airport data from the external API.
     *
     * @throws JsonProcessingException If there is an error processing the JSON response.
     * @throws InterruptedException If the thread is interrupted while fetching data.
     */
    void fetchAirportDataInternal() throws JsonProcessingException, InterruptedException;

    /**
     * Scheduled DB refresh once a day at 2 AM
     */
    void scheduledAirportRefresh();
}
