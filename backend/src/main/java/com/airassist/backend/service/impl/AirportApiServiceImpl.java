package com.airassist.backend.service.impl;

import com.airassist.backend.exception.airport.InvalidAirportDetailsException;
import com.airassist.backend.service.AirportApiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
@NoArgsConstructor
@Getter
public class AirportApiServiceImpl implements AirportApiService {

    private static final Logger logger = LoggerFactory.getLogger(AirportApiServiceImpl.class);

    @Value("${airport.api.url}" + "/distance")
    public String airportApiUrl;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    private final int FIRST_COMPENSATION_LEVEL = 250;
    private final int SECOND_COMPENSATION_LEVEL = 400;
    private final int THIRD_COMPENSATION_LEVEL = 600;
    private final int TIER_ONE_DISTANCE = 1500;
    private final int TIER_TWO_DISTANCE = 3500;

    @PostConstruct
    void init() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
        logger.info("AirportApiServiceImplementation initialized with API URL: {}", airportApiUrl);
    }

    public double getDistance(String departingAirportCode, String destinationAirportCode) throws JsonProcessingException {
        logger.info("Calculating distance from {} to {}", departingAirportCode, destinationAirportCode);

        if (departingAirportCode.equals(destinationAirportCode) || departingAirportCode.isEmpty() || destinationAirportCode.isEmpty()) {
            throw new InvalidAirportDetailsException();
        }

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("from", departingAirportCode);
        requestBody.put("to", destinationAirportCode);

        logger.debug("Sending POST request to airport API: {} with body {}", airportApiUrl, requestBody);

        String response = restTemplate.postForObject(airportApiUrl, requestBody, String.class);
        logger.debug("Received response from airport API.");

        JsonNode root = objectMapper.readTree(response);
        JsonNode responseObject = root.get("data");

        return responseObject.path("attributes").path("kilometers").asDouble();
    }

    public int calculateCompensation(double distance) {
        logger.info("Calculating compensation for distance: {}", distance);

        if (distance < TIER_ONE_DISTANCE) {
            return FIRST_COMPENSATION_LEVEL;
        } else if (distance <= TIER_TWO_DISTANCE) {
            return SECOND_COMPENSATION_LEVEL;
        } else {
            return THIRD_COMPENSATION_LEVEL;
        }
    }
}
