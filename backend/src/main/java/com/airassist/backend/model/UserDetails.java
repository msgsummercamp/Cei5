package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "userdetails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Phone number cannot be blank")
    @Size(max = 15, message = "Phone number must be less than 15")
    @Pattern(regexp = "^[+]?\\d{7,15}$", message = "Phone number must be valid")
    private String phoneNumber;

    @Column(nullable = false)
    @Size(max = 254, message = "Email must be less than 254 characters")
    private String address;

    @Column(nullable = false)
    @Size(max = 10, message = "Postal code must be less than 10 characters")
    private String postalCode;

    @Column(nullable = false)
    private Date birthDate;
}
