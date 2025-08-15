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
import com.airassist.backend.model.User;
import com.airassist.backend.service.AuthService;
import com.airassist.backend.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthService authService;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthController authController;

    @Test
    void signIn_WhenValid_ShouldReturnSignInResponse() throws Exception {
        SignInRequest req = new SignInRequest();
        req.setEmail("test@example.com");
        req.setPassword("pass");
        SignInResponse resp = new SignInResponse("mockToken", true);
        when(authService.signIn(req)).thenReturn(resp);

        ResponseEntity<SignInResponse> result = authController.signIn(req);

        assertEquals(resp, result.getBody());
    }

    @Test
    void signIn_WhenUserNotFound_ShouldThrow() throws Exception {
        SignInRequest req = new SignInRequest();
        req.setEmail("notfound@example.com");
        req.setPassword("pass");
        when(authService.signIn(req)).thenThrow(new UserNotFoundException());

        assertThrows(UserNotFoundException.class, () -> authController.signIn(req));
    }

    @Test
    void signIn_WhenInvalidPassword_ShouldThrow() throws Exception {
        SignInRequest req = new SignInRequest();
        req.setPassword("wrong");
        req.setEmail("test@example.com");
        when(authService.signIn(req)).thenThrow(new InvalidPasswordException());

        assertThrows(InvalidPasswordException.class, () -> authController.signIn(req));
    }

    @Test
    void register_WhenValid_ShouldReturnUserResponseDTO() throws Exception {
        UserDTO userDTO = new UserDTO();
        User user = new User();
        UserResponseDTO userResponseDTO = new UserResponseDTO();

        when(authService.register(userDTO)).thenReturn(user);
        when(userMapper.userToUserResponseDTO(user)).thenReturn(userResponseDTO);

        ResponseEntity<UserResponseDTO> result = authController.register(userDTO);

        assertEquals(userResponseDTO, result.getBody());
    }

    @Test
    void register_WhenDuplicateUser_ShouldThrow() throws Exception {
        UserDTO userDTO = new UserDTO();
        when(authService.register(userDTO)).thenThrow(new DuplicateUserException());

        assertThrows(DuplicateUserException.class, () -> authController.register(userDTO));
    }

    @Test
    void register_WhenMessagingException_ShouldThrow() throws Exception {
        UserDTO userDTO = new UserDTO();
        when(authService.register(userDTO)).thenThrow(new MessagingException());

        assertThrows(MessagingException.class, () -> authController.register(userDTO));
    }

    @Test
    void register_WhenJsonProcessingException_ShouldThrow() throws Exception {
        UserDTO userDTO = new UserDTO();
        when(authService.register(userDTO)).thenThrow(new JsonProcessingException("fail") {});

        assertThrows(JsonProcessingException.class, () -> authController.register(userDTO));
    }

    @Test
    void register_WhenPasswordApiException_ShouldThrow() throws Exception {
        UserDTO userDTO = new UserDTO();
        when(authService.register(userDTO)).thenThrow(new PasswordApiException());

        assertThrows(PasswordApiException.class, () -> authController.register(userDTO));
    }

    @Test
    void resetPassword_WhenValid_ShouldReturnOk() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        doNothing().when(authService).resetPassword(req);

        ResponseEntity<Void> result = authController.resetPassword(req);

        assertEquals(200, result.getStatusCodeValue());
        assertNull(result.getBody());
    }

    @Test
    void resetPassword_WhenMessagingException_ShouldThrow() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        doThrow(new MessagingException()).when(authService).resetPassword(req);

        assertThrows(MessagingException.class, () -> authController.resetPassword(req));
    }

    @Test
    void resetPassword_WhenUserNotFound_ShouldThrow() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        doThrow(new UserNotFoundException()).when(authService).resetPassword(req);

        assertThrows(UserNotFoundException.class, () -> authController.resetPassword(req));
    }

    @Test
    void resetPassword_WhenJsonProcessingException_ShouldThrow() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        doThrow(new JsonProcessingException("fail") {}).when(authService).resetPassword(req);

        assertThrows(JsonProcessingException.class, () -> authController.resetPassword(req));
    }

    @Test
    void resetPassword_WhenPasswordApiException_ShouldThrow() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        doThrow(new PasswordApiException()).when(authService).resetPassword(req);

        assertThrows(PasswordApiException.class, () -> authController.resetPassword(req));
    }
}