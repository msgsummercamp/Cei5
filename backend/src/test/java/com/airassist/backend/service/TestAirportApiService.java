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
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;


@SpringBootTest
public class TestAirportApiService {

    @Autowired
    private AirportApiServiceImplementation airportApiService;

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
        final double DISTANCE_JFK_LAX = 3974.196718494172;
        String departingAirportCode = "JFK";
        String destinationAirportCode = "LAX";

        double distance = airportApiService.getDistance(departingAirportCode, destinationAirportCode);

        assertEquals(DISTANCE_JFK_LAX, distance);
    }

    @Test
    void getDistance_shouldThrowExceptionForSameAirport() throws JsonProcessingException {
        String departingAirportCode = "JFK";
        String destinationAirportCode = "JFK";

        assertThrows(InvalidAirportDetailsException.class, () ->
                    airportApiService.getDistance(departingAirportCode, destinationAirportCode)
        );
    }

    @Test
    void getDistance_shouldThrowExceptionForEmptyAirportCode() throws JsonProcessingException {
        String departingAirportCode = "";
        String destinationAirportCode = "LAX";

        assertThrows(InvalidAirportDetailsException.class, () ->
                    airportApiService.getDistance(departingAirportCode, destinationAirportCode)
        );
    }

    @Test
    void calculateCompensation_shouldReturn250ForShortDistance() throws JsonProcessingException {
        final double DISTANCE = 1000.0;
        final int FIRST_COMPENSATION_LEVEL = 250;

        int compensationLevel = airportApiService.calculateCompensation(DISTANCE);
        assertThat(compensationLevel, is(FIRST_COMPENSATION_LEVEL));
    }

    @Test
    void calculateCompensation_shouldReturn400ForMediumDistance() throws JsonProcessingException {
        final double DISTANCE = 2000.0;
        final int SECOND_COMPENSATION_LEVEL = 400;

        int compensationLevel = airportApiService.calculateCompensation(DISTANCE);
        assertThat(compensationLevel, is(SECOND_COMPENSATION_LEVEL));
    }

    @Test
    void calculateCompensation_shouldReturn600ForLongDistance() throws JsonProcessingException {
        final double DISTANCE = 4000.0;
        final int THIRD_COMPENSATION_LEVEL = 600;

        int compensationLevel = airportApiService.calculateCompensation(DISTANCE);
        assertThat(compensationLevel, is(THIRD_COMPENSATION_LEVEL));
    }
}
