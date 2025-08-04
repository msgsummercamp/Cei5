package com.airassist.backend.model;

import com.airassist.backend.dto.flight.FlightDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"comments", "cases", "userDetails"})
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Reservation number cannot be blank")
    @Size(min = 6, max = 6, message = "Reservation number must be exactly 6 characters")
    private String reservationNumber;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Flight> flights;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL)
    private Case caseEntity;
}
