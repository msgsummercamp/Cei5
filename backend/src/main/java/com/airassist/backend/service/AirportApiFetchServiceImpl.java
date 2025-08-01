package com.airassist.backend.service;

import com.airassist.backend.model.Airport;
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

import java.util.ArrayList;
import java.util.List;

@Service
@NoArgsConstructor
@Getter
public class AirportApiFetchServiceImpl implements AirportApiFetchService {

    private static final Logger logger = LoggerFactory.getLogger(AirportApiFetchServiceImpl.class);

    @Value("https://airportgap.com/api/airports?page=1")
    public String airportApiUrl;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    @PostConstruct
    void init() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
        logger.info("AirportApiFetchServiceImplementation initialized with API URL: {}", airportApiUrl);
    }

    @Override
    public List<Airport> fetchAirportData() throws JsonProcessingException, InterruptedException {
        logger.info("Fetching airport data from API: {}", airportApiUrl);

        List<Airport> airports = new ArrayList<>();
        String nextPageUrl = airportApiUrl;

        while (nextPageUrl != null) {
            Thread.sleep(650);
            String response = restTemplate.getForObject(nextPageUrl, String.class);
            JsonNode root = objectMapper.readTree(response);

            JsonNode airportArray = root.get("data");
            if (airportArray != null && airportArray.isArray()) {
                for (JsonNode airportNode : airportArray) {
                    JsonNode attributes = airportNode.get("attributes");

                    Airport airport = new Airport();
                    airport.setCode(attributes.path("iata").asText());
                    airport.setName(attributes.path("name").asText());
                    airport.setCity(attributes.path("city").asText());
                    airport.setCountry(attributes.path("country").asText());
                    airports.add(airport);
                }
            }

            JsonNode linksNode = root.get("links");
            if (linksNode != null && linksNode.has("next")) {
                if (!linksNode.get("self").asText().equals(linksNode.get("last").asText())) {
                    nextPageUrl = linksNode.get("next").asText();
                    logger.info("Fetching next page: {}", nextPageUrl);
                } else {
                    nextPageUrl = null;
                }
            } else {
                nextPageUrl = null;
            }
        }

        logger.info("Fetched total airports: {}", airports.size());
        return airports;
    }
}
