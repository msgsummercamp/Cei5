package com.airassist.backend.service;

import com.airassist.backend.dto.auth.ResetPasswordRequest;
import com.airassist.backend.dto.auth.SignInRequest;
import com.airassist.backend.dto.auth.SignInResponse;
import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.exception.auth.InvalidPasswordException;
import com.airassist.backend.exception.auth.InvalidTokenException;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.mail.MessagingException;

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
     * @throws MessagingException if there is an error sending the registration email
     * @throws JsonProcessingException if there is an error processing JSON data for the password
     */
    User register(UserDTO userDTO) throws DuplicateUserException, MessagingException, JsonProcessingException;

    /**
     * Initiates the password reset process for a user.
     * This method generates a new password and sends it to the user's email.
     * @param resetPasswordRequest the request containing the user's email
     * @throws MessagingException if there is an error sending the reset password email
     * @throws UserNotFoundException if the user with the provided email does not exist
     * @throws JsonProcessingException if there is an error processing JSON data for the password
     */
    void resetPassword(ResetPasswordRequest resetPasswordRequest) throws MessagingException, UserNotFoundException, JsonProcessingException;

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
