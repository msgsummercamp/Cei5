package com.airassist.backend.controller;

import com.airassist.backend.dto.auth.ResetPasswordRequest;
import com.airassist.backend.dto.auth.SignInRequest;
import com.airassist.backend.dto.auth.SignInResponse;
import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserResponseDTO;
import com.airassist.backend.exception.auth.InvalidPasswordException;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.PasswordApiException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.service.AuthService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponse> signIn(@RequestBody SignInRequest signInRequest) throws UserNotFoundException, InvalidPasswordException {
        return ResponseEntity.ok(authService.signIn(signInRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserDTO userToRegister) throws DuplicateUserException, MessagingException, JsonProcessingException, PasswordApiException {
        User newUser = authService.register(userToRegister);
        UserResponseDTO userResponse = userMapper.userToUserResponseDTO(newUser);
        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) throws MessagingException, UserNotFoundException, JsonProcessingException, PasswordApiException {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
