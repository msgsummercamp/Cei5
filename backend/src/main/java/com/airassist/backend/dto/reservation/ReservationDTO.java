package com.airassist.backend.dto.reservation;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.dto.flight.FlightDTO;
import com.airassist.backend.model.Flight;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ReservationDTO {

    @Size(min = 6, max = 6)
    private String reservationNumber;

    private List<FlightDTO> flights;
}
