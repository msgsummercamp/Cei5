package com.airassist.backend.service;

import com.airassist.backend.exception.InvalidAirportDetailsException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;


/**
 * Service class to interact with the Airport API for distance calculations and compensation levels.
 */
@Service
@NoArgsConstructor
public class AirportApiService {

    @Value("https://airportgap.com/api/airports/distance")
    private String airportApiUrl;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    @PostConstruct
    private void init() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Fetches the distance between two airports using their IATA codes.
     *
     * @param fromAirport The IATA code of the departing airport.
     * @param toAirport The IATA code of the destination airport.
     * @return The distance in kilometers between the two airports.
     * @throws JsonProcessingException If there is an error processing the JSON response.
     * @throws InvalidAirportDetailsException If either of the airport codes is not found in the response.
     */
    public double getDistance(String fromAirport, String toAirport) throws JsonProcessingException {

        if (fromAirport.equals(toAirport) || fromAirport.isEmpty() || toAirport.isEmpty()) {
            throw new InvalidAirportDetailsException(fromAirport, toAirport);
        }

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("from", fromAirport);
        requestBody.put("to", toAirport);

        String response = restTemplate.postForObject(airportApiUrl, requestBody, String.class);
        JsonNode root = objectMapper.readTree(response);
        JsonNode responseObject = root.get("data");

        return responseObject.path("attributes").path("kilometers").asDouble();
    }

    /**
     * Calculates the compensation level based on the distance between two airports.
     *
     * @param distance The distance in kilometers.
     * @return The compensation level as an integer.
     */
    public int calculateCompensation(double distance) {
        if (distance < 1500) {
            return 250;
        } else if (distance <= 3500) {
            return 400;
        } else {
            return 600;
        }
    }
}
