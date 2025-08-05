package com.airassist.backend.controller;

import com.airassist.backend.model.Airport;
import com.airassist.backend.service.impl.AirportApiFetchServiceImpl;
import com.airassist.backend.service.impl.AirportApiServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller class to handle API requests related to airports.
 */
@RestController
@RequestMapping("/api/airports")
@AllArgsConstructor
public class AirportApiController {
    private final AirportApiServiceImpl airportApiService;
    private final AirportApiFetchServiceImpl airportApiFetchService;

    /**
     * Fetches airport data from the external API and returns a list of airports.
     *
     * @return List of airports fetched from the API.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     * @throws InterruptedException If the thread is interrupted while fetching data.
     */
    @GetMapping("/fetch")
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
    @PostMapping("/compensation")
    public int calculateCompensationLevel(@RequestParam String departingAirportCode, @RequestParam String destinationAirportCode) throws JsonProcessingException {
        return airportApiService.calculateCompensation(airportApiService.getDistance(departingAirportCode, destinationAirportCode));
    }
}
