package com.airassist.backend.dto.user;

import com.airassist.backend.model.enums.Roles;
import lombok.Data;

import java.util.UUID;

@Data
public class UserResponseDTO {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Roles role;
    private UserDetailsResponseDTO userDetails;
    private Boolean isFirstLogin;
}
