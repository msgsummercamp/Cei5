package com.airassist.backend.controller;

import com.airassist.backend.service.AirportApiServiceImplementation;
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
    private AirportApiServiceImplementation airportApiService;

    @Autowired
    public AirportApiController(AirportApiServiceImplementation airportApiService) {
        this.airportApiService = airportApiService;
    }

    /**
     * Calculates the compensation level based on the distance between two airports.
     *
     * @param departingAirportCode The IATA code.
     * @param destinationAirportCode The IATA code.
     * @return The compensation level based on the distance.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     */
    @PostMapping("/api/airports/compensation")
    public int calculateCompensationLevel(@RequestParam String departingAirportCode, @RequestParam String destinationAirportCode) throws JsonProcessingException {
        return airportApiService.calculateCompensation(airportApiService.getDistance(departingAirportCode, destinationAirportCode));
    }
}
