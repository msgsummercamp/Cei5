package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@Table(name = "beneficiaries")
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column
    @Size(max = 50, message = "First name must be less than 50 characters")
    private String firstName;

    @Column
    @Size(max = 50, message = "Last name must be less than 50 characters")
    private String lastName;

    @Column(nullable = false)
    @Size(max = 254, message = "Address must be less than 254 characters")
    private String address;

    @Column(nullable = false)
    @Size(max = 10, message = "Postal code must be less than 10 characters")
    private String postalCode;

    @Column(nullable = false)
    private Boolean isUnderage;

}
