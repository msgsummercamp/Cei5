package com.airassist.backend.controller;

import com.airassist.backend.model.Airport;
import com.airassist.backend.service.AirportApiFetchServiceImplementation;
import com.airassist.backend.service.AirportApiServiceImplementation;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller class to handle API requests related to airports.
 */
@RestController
public class AirportApiController {
    private final AirportApiServiceImplementation airportApiService;
    private final AirportApiFetchServiceImplementation airportApiFetchService;

    @Autowired
    public AirportApiController(AirportApiServiceImplementation airportApiService, AirportApiFetchServiceImplementation airportApiFetchService) {
        this.airportApiService = airportApiService;
        this.airportApiFetchService = airportApiFetchService;
    }

    @GetMapping("/api/airports/fetch")
    public List<Airport> fetchAirports() throws JsonProcessingException, InterruptedException {
        return airportApiFetchService.fetchAirportData();
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
