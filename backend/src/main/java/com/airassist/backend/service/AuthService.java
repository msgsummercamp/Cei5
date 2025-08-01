package com.airassist.backend.service;

import com.airassist.backend.dto.auth.SignInRequest;
import com.airassist.backend.dto.auth.SignInResponse;
import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.exception.auth.InvalidPasswordException;
import com.airassist.backend.exception.auth.InvalidTokenException;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.User;

public interface AuthService {

    /**
     * Signs in a user with the provided credentials.
     *
     * @param signInRequest the sign-in request containing username and password
     * @return SignInResponse containing the JWT token and user roles
     * @throws UserNotFoundException if the user is not found
     * @throws InvalidPasswordException if the provided password is incorrect
     */
    SignInResponse signIn(SignInRequest signInRequest) throws UserNotFoundException, InvalidPasswordException;

    /**
     * Registers a new user with the provided user details.
     *
     * @param userDTO the user details for registration
     * @return User the registered user entity
     * @throws DuplicateUserException if a user with the same username or email already exists
     */
    User register(UserDTO userDTO) throws DuplicateUserException;

    /**
     * Validates the provided JWT token.
     *
     *
     * @param token the JWT token to validate
     * @return true if the token is valid, false otherwise
     */
    boolean validateToken(String token);

    /**
     * Extracts the email from the provided JWT token.
     *
     * @param token the JWT token from which to extract the email
     * @return the email extracted from the token
     * @throws InvalidTokenException if the token has a missing email claim
     */
    String getEmailFromToken(String token) throws InvalidTokenException;
}
