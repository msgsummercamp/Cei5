package com.airassist.backend.dto.user;

import com.airassist.backend.model.Roles;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserDetailsResponseDTO {
    private UUID id;
    private String phoneNumber;
    private String address;
    private String postalCode;
    private LocalDate birthDate;
}
