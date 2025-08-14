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

    @Column(nullable = true)
    private LocalDate flightDate;

    @Column(nullable = true)
    @Size(min = 3, max = 6, message = "Flight number must be between 3 and 6 characters")
    private String flightNumber;

    @Column(nullable = true)
    @Size(min = 3, max = 3, message = "Airport codes must be exactly 3 characters")
    private String departingAirport;

    @Column(nullable = true)
    @Size(min = 3, max = 3, message = "Airport codes must be exactly 3 characters")
    private String destinationAirport;

    @Column(nullable = true)
    private LocalDateTime departureTime;

    @Column(nullable = true)
    private LocalDateTime arrivalTime;

    @ManyToOne(optional = true)
    @JoinColumn(referencedColumnName = "id")
    private Reservation reservation;

    @Column(nullable = true)
    @Size(min = 3, max = 50, message = "Airline must be between 3 and 50 characters")
    private String airLine;

    @Column(nullable = true)
    private boolean problematic;

}
