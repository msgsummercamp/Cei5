package com.airassist.backend.dto.user;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserDetailsDTO {

    @Size(max = 15, message = "Phone number must be less than 15")
    @Pattern(regexp = "^[+]?\\d{7,15}$", message = "Phone number must be valid")
    private String phoneNumber;

    @Size(max = 254, message = "Address must be less than 254 characters")
    private String address;

    @Size(max = 10, message = "Postal code must be less than 10 characters")
    private String postalCode;

    @PastOrPresent(message = "Birth date cannot be in the future")
    private LocalDate birthDate;
}
