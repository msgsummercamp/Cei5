package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column
    private LocalDate flightDate;

    @Column
    @Size(min = 3, max = 6, message = "Flight number must be between 3 and 6 characters")
    private String flightNumber;

    @Column
    @Size(min = 3, max = 3, message = "Airport codes must be exactly 3 characters")
    private String departingAirport;

    @Column
    @Size(min = 3, max = 3, message = "Airport codes must be exactly 3 characters")
    private String destinationAirport;

    @Column
    private LocalDateTime departureTime;

    @Column
    private LocalDateTime arrivalTime;

    @ManyToOne(optional = true)
    @JoinColumn(referencedColumnName = "id")
    private Reservation reservation;

    @Column
    @Size(min = 3, max = 50, message = "Airline must be between 3 and 50 characters")
    private String airLine;

    @Column
    private boolean problematic;

}
