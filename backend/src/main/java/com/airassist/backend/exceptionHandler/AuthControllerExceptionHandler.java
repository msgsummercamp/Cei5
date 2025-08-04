package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.AuthController;
import com.airassist.backend.exception.auth.InvalidPasswordException;
import com.airassist.backend.exception.auth.InvalidTokenException;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthControllerExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ProblemDetail handleInvalidPassword(InvalidPasswordException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ProblemDetail handleDuplicateUser(DuplicateUserException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "User already exists");
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ProblemDetail handleInvalidToken(InvalidTokenException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(MessagingException.class)
    public ProblemDetail handleMessagingException(MessagingException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send email: " + exception.getMessage());
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ProblemDetail handleJsonProcessingException(JsonProcessingException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process password JSON: " + exception.getMessage());
    }
}
