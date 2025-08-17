package com.airassist.backend.service.impl;

import com.airassist.backend.model.Airport;
import com.airassist.backend.service.AirportApiFetchService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.AsyncLoadingCache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
@NoArgsConstructor
public class AirportApiFetchServiceImpl implements AirportApiFetchService {

    private static final Logger logger = LoggerFactory.getLogger(AirportApiFetchServiceImpl.class);
    private static final String AIRPORTS_CACHE_KEY = "allAirports";

    @Value("${airport.api.url}")
    public String airportApiUrl;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    private final ExecutorService cacheExecutor = Executors.newFixedThreadPool(1);

    private AsyncLoadingCache<String, List<Airport>> airportsCache;

    @PostConstruct
    void init() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
        logger.info("AirportApiFetchServiceImplementation initialized with API URL: {}", airportApiUrl);

        this.airportsCache = Caffeine.newBuilder()
                .maximumSize(1)
                .refreshAfterWrite(1, TimeUnit.DAYS)
                // The hard expiration can be slightly longer to handle cases where
                // the refresh fails. We still want to serve the old data.
                .expireAfterWrite(2, TimeUnit.DAYS)
                .executor(cacheExecutor)
                .buildAsync(key -> fetchAirportDataInternal());
    }

    @PreDestroy
    private void shutdownExecutor() {
        logger.info("Shutting down cacheExecutor.");
        cacheExecutor.shutdown();
        try {
            if (!cacheExecutor.awaitTermination(60, TimeUnit.SECONDS)) {
                cacheExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            cacheExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public List<Airport> fetchAirportData() {
        return this.airportsCache.get(AIRPORTS_CACHE_KEY).join();
    }

    @Override
    public List<Airport> fetchAirportDataInternal() throws InterruptedException, JsonProcessingException {
        logger.info("Starting asynchronous refresh of airport data.");

        List<Airport> airports = new ArrayList<>();
        String nextPageUrl = airportApiUrl;

        while (nextPageUrl != null) {
            Thread.sleep(700);
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

        logger.info("Successfully refreshed and fetched total airports: {}", airports.size());
        return airports;
    }
}