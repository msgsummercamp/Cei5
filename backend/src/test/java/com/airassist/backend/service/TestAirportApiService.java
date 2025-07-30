package com.airassist.backend.service;

import com.airassist.backend.exception.InvalidAirportDetailsException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
public class TestAirportApiService {

    @Autowired
    private AirportApiService airportApiService;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void getDistance_shouldGetDistanceBetweenAirports() throws JsonProcessingException {
        String fromAirport = "JFK";
        String toAirport = "LAX";

        double distance = airportApiService.getDistance(fromAirport, toAirport);

        assertEquals(3974.196718494172, distance);
    }

    @Test
    void getDistance_shouldThrowExceptionForSameAirport() throws JsonProcessingException {
        String fromAirport = "JFK";
        String toAirport = "JFK";

        assertThrows(InvalidAirportDetailsException.class, () ->
                    airportApiService.getDistance(fromAirport, toAirport)
        );
    }

    @Test
    void getDistance_shouldThrowExceptionForEmptyAirportCode() throws JsonProcessingException {
        String fromAirport = "";
        String toAirport = "LAX";

        assertThrows(InvalidAirportDetailsException.class, () ->
                    airportApiService.getDistance(fromAirport, toAirport)
        );
    }

    @Test
    void calculateCompensation_shouldReturn250ForShortDistance() throws JsonProcessingException {
        double distance = 1000.0;
        int compensationLevel = airportApiService.calculateCompensation(distance);
        assertEquals(250, compensationLevel);
    }

    @Test
    void calculateCompensation_shouldReturn400ForMediumDistance() throws JsonProcessingException {
        double distance = 2000.0;
        int compensationLevel = airportApiService.calculateCompensation(distance);
        assertEquals(400, compensationLevel);
    }

    @Test
    void calculateCompensation_shouldReturn600ForLongDistance() throws JsonProcessingException {
        double distance = 4000.0;
        int compensationLevel = airportApiService.calculateCompensation(distance);
        assertEquals(600, compensationLevel);
    }
}
