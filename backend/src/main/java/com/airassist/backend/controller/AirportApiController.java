package com.airassist.backend.controller;

import com.airassist.backend.service.AirportApiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller class to handle API requests related to airports.
 */
@RestController
public class AirportApiController {
    private AirportApiService airportApiService;

    @Autowired
    public AirportApiController(AirportApiService airportApiService) {
        this.airportApiService = airportApiService;
    }

    /**
     * Calculates the compensation level based on the distance between two airports.
     *
     * @param fromAirportCode The IATA code of the departing airport.
     * @param toAirportCode The IATA code of the destination airport.
     * @return The compensation level based on the distance.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     */
    @PostMapping("/api/airports/compensation")
    public int calculateCompensationLevel(@RequestParam String fromAirportCode, @RequestParam String toAirportCode) throws JsonProcessingException {
        return airportApiService.calculateCompensation(airportApiService.getDistance(fromAirportCode, toAirportCode));
    }
}
