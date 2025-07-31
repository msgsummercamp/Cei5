package com.airassist.backend.dto.auth;

import com.airassist.backend.model.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignInResponse {
    private String token;
    private Roles role;
    private boolean isFirstTimeLogin;
}
