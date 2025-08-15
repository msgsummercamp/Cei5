package com.airassist.backend.service;

import com.airassist.backend.dto.auth.ResetPasswordRequest;
import com.airassist.backend.dto.auth.SignInRequest;
import com.airassist.backend.dto.auth.SignInResponse;
import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.exception.auth.InvalidPasswordException;
import com.airassist.backend.exception.auth.InvalidTokenException;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.service.impl.AuthServiceImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.security.Key;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RandomPasswordGeneratorService randomPasswordGenerator;
    @Mock
    private MailSenderService mailSenderService;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private Key jwtSecret;

    @BeforeEach
    void setUp() throws Exception {
        jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        Field secretField = AuthServiceImpl.class.getDeclaredField("jwtSecret");
        secretField.setAccessible(true);
        secretField.set(authService, jwtSecret);
    }

    @Test
    void signIn_WhenUserExistsAndPasswordMatches_ShouldReturnSignInResponse() throws Exception {
        String email = "test@example.com";
        String password = "password";
        String encodedPassword = "encoded";
        SignInRequest request = new SignInRequest();
        request.setPassword(password);
        request.setEmail(email);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setIsFirstLogin(Boolean.TRUE);
        user.setRole(Roles.USER);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, encodedPassword)).thenReturn(true);

        SignInResponse response = authService.signIn(request);

        assertNotNull(response.getToken());
        assertTrue(response.isFirstTimeLogin());
    }

    @Test
    void signIn_WhenUserDoesNotExist_ShouldThrowUserNotFoundException() {
        String email = "notfound@example.com";
        SignInRequest request = new SignInRequest();
        request.setEmail(email);
        request.setPassword("pass");
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.signIn(request));
    }

    @Test
    void signIn_WhenPasswordDoesNotMatch_ShouldThrowInvalidPasswordException() {
        String email = "test@example.com";
        String password = "password";
        String encodedPassword = "encoded";
        SignInRequest request = new SignInRequest();
        request.setPassword(password);
        request.setEmail(email);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setIsFirstLogin(Boolean.TRUE);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, encodedPassword)).thenReturn(false);

        assertThrows(InvalidPasswordException.class, () -> authService.signIn(request));
    }

    @Test
    void register_WhenUserDoesNotExist_ShouldRegisterAndSendEmail() throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("new@example.com");
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setRole(null);

        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(false);
        when(userMapper.userDTOToUser(userDTO)).thenReturn(user);
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn("randomPass");
        when(passwordEncoder.encode("randomPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.register(userDTO);

        assertEquals(userDTO.getEmail(), result.getEmail());
        assertEquals(Roles.USER, result.getRole());
        assertTrue(result.getIsFirstLogin());
        verify(mailSenderService).sendGeneratedPasswordEmail(eq(userDTO.getEmail()), eq("randomPass"));
    }

    @Test
    void register_WhenUserAlreadyExists_ShouldThrowDuplicateUserException() {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("exists@example.com");
        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> authService.register(userDTO));
    }

    @Test
    void register_WhenMailSenderThrows_ShouldPropagateException() throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("mailfail@example.com");
        User user = new User();
        user.setEmail(userDTO.getEmail());

        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(false);
        when(userMapper.userDTOToUser(userDTO)).thenReturn(user);
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn("randomPass");
        when(passwordEncoder.encode("randomPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(user);
        doThrow(new MessagingException()).when(mailSenderService).sendGeneratedPasswordEmail(anyString(), anyString());

        assertThrows(MessagingException.class, () -> authService.register(userDTO));
    }

    @Test
    void resetPassword_WhenUserExists_ShouldResetAndSendEmail() throws Exception {
        String email = "reset@example.com";
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail(email);

        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn("newPass");
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNewPass");
        when(userRepository.save(user)).thenReturn(user);

        authService.resetPassword(req);

        assertTrue(user.getIsFirstLogin());
        verify(mailSenderService).sendGeneratedPasswordEmail(eq(email), eq("newPass"));
    }

    @Test
    void resetPassword_WhenUserDoesNotExist_ShouldThrowUserNotFoundException() {
        String email = "notfound@example.com";
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.resetPassword(req));
    }

    @Test
    void resetPassword_WhenMailSenderThrows_ShouldPropagateException() throws Exception {
        String email = "fail@example.com";
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail(email);

        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn("newPass");
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNewPass");
        when(userRepository.save(user)).thenReturn(user);
        doThrow(new MessagingException()).when(mailSenderService).sendGeneratedPasswordEmail(anyString(), anyString());

        assertThrows(MessagingException.class, () -> authService.resetPassword(req));
    }

    @Test
    void validateToken_WhenTokenIsValid_ShouldReturnTrue() throws Exception {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("valid@example.com");
        user.setRole(Roles.USER);

        String token = Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .signWith(jwtSecret)
                .compact();

        assertTrue(authService.validateToken(token));
    }

    @Test
    void validateToken_WhenTokenIsInvalid_ShouldThrowInvalidTokenException() {
        String invalidToken = "invalid.token.value";
        assertThrows(InvalidTokenException.class, () -> authService.validateToken(invalidToken));
    }

    @Test
    void getEmailFromToken_WhenTokenIsValid_ShouldReturnEmail() throws Exception {
        String email = "token@example.com";
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setRole(Roles.USER);

        String token = Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", email)
                .claim("role", user.getRole())
                .signWith(jwtSecret)
                .compact();

        String extractedEmail = authService.getEmailFromToken(token);
        assertEquals(email, extractedEmail);
    }

    @Test
    void getEmailFromToken_WhenTokenHasNoEmail_ShouldThrowInvalidTokenException() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole(Roles.USER);

        String token = Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("role", user.getRole())
                .signWith(jwtSecret)
                .compact();

        assertThrows(InvalidTokenException.class, () -> authService.getEmailFromToken(token));
    }

    @Test
    void register_WhenUserHasRole_ShouldNotOverwriteRole() throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("admin@example.com");
        userDTO.setRole(Roles.ADMIN);

        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setRole(Roles.ADMIN);

        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(false);
        when(userMapper.userDTOToUser(userDTO)).thenReturn(user);
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn("randomPass");
        when(passwordEncoder.encode("randomPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.register(userDTO);

        assertEquals(Roles.ADMIN, result.getRole());
    }
}