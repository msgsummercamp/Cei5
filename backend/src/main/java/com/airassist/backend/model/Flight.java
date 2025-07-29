package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Time;
import java.util.Date;
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

    @Column(nullable = false)
    @NotBlank(message = "Flight date cannot be blank")
    @PastOrPresent(message = "Flight date must be in the past or present")
    private Date flightDate;

    @Column(nullable = false)
    @NotBlank(message = "Flight number cannot be blank")
    @Size(min = 3, max = 6, message = "Flight number must be between 3 and 6 characters")
    private String flightNumber;

    @Column(nullable = false)
    @NotBlank(message = "Airline name cannot be blank")
    @Size(min = 3, max = 3, message = "Airport codes must be exactly 3 characters")
    private String departingAirport;

    @Column(nullable = false)
    @NotBlank(message = "Destination airport cannot be blank")
    @Size(min = 3, max = 3, message = "Airport codes must be exactly 3 characters")
    private String destinationAirport;

    @Column(nullable = false)
    @NotBlank(message = "Departure time cannot be blank")
    private Time departureTime;

    @Column(nullable = false)
    @NotBlank(message = "Arrival time cannot be blank")
    private Time arrivalTime;

    @ManyToOne(optional = false)
    @JoinColumn(referencedColumnName = "id")
    private Reservation reservation;

    @Column(nullable = false)
    @NotBlank(message = "Airline cannot be blank")
    @Size(min = 3, max = 50, message = "Airline must be between 3 and 50 characters")
    private String airLine;

    @Column(nullable = false)
    @NotBlank(message = "Passenger name cannot be blank")
    private boolean isProblematic;
}
