package com.airassist.backend.service;

import com.airassist.backend.dto.auth.SignInRequest;
import com.airassist.backend.dto.auth.SignInResponse;
import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.exception.auth.InvalidPasswordException;
import com.airassist.backend.exception.auth.InvalidTokenException;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RandomPasswordGeneratorService randomPasswordGenerator;
    private final UserMapper userMapper;
    private final Key jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long JWT_EXPIRATION_MS = 3600000; // 1 hour in milliseconds

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper, RandomPasswordGeneratorService randomPasswordGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.randomPasswordGenerator = randomPasswordGenerator;
        this.userMapper = userMapper;
    }

    @Override
    public SignInResponse signIn(SignInRequest signInRequest) throws UserNotFoundException, InvalidPasswordException {
        log.info("Signing in user with email: {}", signInRequest.getEmail());
        var user = userRepository.findByEmail(signInRequest.getEmail());
        if (user.isEmpty()) {
            throw new UserNotFoundException("User not found with email: " + signInRequest.getEmail());
        }
        User foundUser = user.get();
        if(!passwordEncoder.matches(signInRequest.getPassword(), foundUser.getPassword())) {
            throw new InvalidPasswordException("Invalid password for user: " + signInRequest.getEmail());
        }
        String token = generateToken(foundUser);
        return new SignInResponse(token, foundUser.getRole(), foundUser.isFirstLogin());
    }

    @Override
    public User register(UserDTO userDTO) throws DuplicateUserException {
        log.info("Registering user with email: {}", userDTO.getEmail());
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new DuplicateUserException();
        }
        User user = userMapper.userDTOToUser(userDTO);
        user.setPassword(randomPasswordGenerator.generateRandomPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setFirstLogin(true);
        user = userRepository.save(user);
        log.info("User registered successfully with email: {}", user.getEmail());
        return user;
    }

    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtSecret)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getEmailFromToken(String token) throws InvalidTokenException {
        String email = Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("email", String.class);
        if (email == null) {
            throw new InvalidTokenException("Email claim not found in token");
        }
        return email;
    }

    /**
     * Generates a JWT token for the user.
     * @param user the user for whom the token is generated
     * @return the generated JWT token
     */
    private String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(jwtSecret)
                .compact();
    }
}
