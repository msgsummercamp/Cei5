package com.airassist.backend.dto.flight;

import com.airassist.backend.dto.reservation.ReservationDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FlightDTO {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate flightDate;

    @Size(min = 3, max = 6)
    private String flightNumber;

    @Size(min = 3, max = 3)
    private String departingAirport;

    @Size(min = 3, max = 3)
    private String destinationAirport;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime departureTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime arrivalTime;

    private ReservationDTO reservation;

    @Size(min = 3, max = 50)
    private String airLine;

    private boolean problematic;



}

