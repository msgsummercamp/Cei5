package com.airassist.backend.dto.beneficiary;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;


import java.util.UUID;

@Data
@AllArgsConstructor
public class BeneficiaryDTO {

    private UUID id;

    @Size(max = 50, message = "First name must be less than 50 characters")
    private String firstName;

    @Size(max = 50, message = "Last name must be less than 50 characters")
    private String lastName;

    @Size(max = 254, message = "Address must be less than 254 characters")
    private String address;

    @Size(max = 10, message = "Postal code must be less than 10 characters")
    private String postalCode;

    private Boolean isUnderage;
}
