package com.airassist.backend.exceptionHandler;

import com.airassist.backend.controller.CommentController;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.enums.ApiErrorMessages;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = CommentController.class)
public class CommentControllerExceptionHandler {
    @ExceptionHandler(CaseNotFoundException.class)
    public ProblemDetail handleCaseNotFound(CaseNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.ILLEGAL_ARGUMENT.getCode());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.NOT_FOUND, ApiErrorMessages.USER_NOT_FOUND.getCode());
    }
}
