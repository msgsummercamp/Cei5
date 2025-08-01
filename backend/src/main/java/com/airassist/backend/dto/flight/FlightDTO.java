package com.airassist.backend.dto.flight;

import com.airassist.backend.dto.reservation.ReservationDTO;
import com.airassist.backend.model.Reservation;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FlightDTO {

    @PastOrPresent(message = "Flight date must be in the past or present")
    private LocalDate flightDate;

    @Size(min = 3, max = 6)
    private String flightNumber;

    @Size(min = 3, max = 3)
    private String departingAirport;

    @Size(min = 3, max = 3)
    private String destinationAirport;


    private LocalDateTime departureTime;

    private LocalDateTime arrivalTime;

    private ReservationDTO reservation;

    @Size(min = 3, max = 50)
    private String airLine;

    private boolean isProblematic;


}

