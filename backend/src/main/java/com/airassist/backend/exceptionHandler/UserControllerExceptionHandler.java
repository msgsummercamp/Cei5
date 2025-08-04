package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.UserController;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = UserController.class)
public class UserControllerExceptionHandler {

    @ExceptionHandler(DuplicateUserException.class)
    public ProblemDetail handleDuplicateUserException(DuplicateUserException e) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFoundException(UserNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgumentException(IllegalArgumentException e) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String errorMsg = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Invalid input");
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.BAD_REQUEST, errorMsg);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(ConstraintViolationException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Database constraint violation: " + e.getMessage());
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ProblemDetail handleJsonProcessingException(JsonProcessingException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process password JSON: " + exception.getMessage());
    }
}
