package com.airassist.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CacheWarmer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CacheWarmer.class);
    private final AirportApiFetchServiceImpl airportApiFetchService;

    public CacheWarmer(AirportApiFetchServiceImpl airportApiFetchService) {
        this.airportApiFetchService = airportApiFetchService;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting cache warm-up for airports list...");
        try {
            // Trigger the initial cache population.
            // .join() is necessary here to ensure the startup process waits
            // for the fetch to complete before the application is considered "ready".
            airportApiFetchService.fetchAirportData();
            logger.info("Cache warm-up for airports list completed successfully.");
        } catch (Exception e) {
            logger.error("Failed to warm up the airport cache on startup.", e);
        }
    }
}