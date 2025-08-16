package com.airassist.backend.controller;

import com.airassist.backend.exception.auth.InvalidTokenException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.TokenResponse;
import com.airassist.backend.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/refresh-token")
@AllArgsConstructor
public class RefreshTokenController {
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<TokenResponse> refreshToken(@RequestHeader("Authorization") String authorizationHeader) throws UserNotFoundException, InvalidTokenException {
        String token = authorizationHeader.startsWith("Bearer ") ? authorizationHeader.substring(7) : authorizationHeader;
        TokenResponse tokenResponse = authService.checkTokenValidityAndRenew(token);
        return ResponseEntity.ok(tokenResponse);
    }
}
