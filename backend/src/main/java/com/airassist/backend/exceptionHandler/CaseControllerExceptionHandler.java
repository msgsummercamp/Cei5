package com.airassist.backend.exceptionHandler;


import com.airassist.backend.controller.CaseController;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.model.enums.ApiErrorMessages;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice(assignableTypes = CaseController.class)
public class CaseControllerExceptionHandler {

    @ExceptionHandler(CaseNotFoundException.class)
    public ProblemDetail handleCaseNotFound(CaseNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.BAD_REQUEST, ApiErrorMessages.CASE_VALIDATION_ERROR.getCode());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.CONFLICT, ApiErrorMessages.DATA_INTEGRITY_VIOLATION.getCode());
    }

    @ExceptionHandler(RuntimeException.class)
    public ProblemDetail handleRuntime(RuntimeException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.GENERIC_SERVER_ERROR.getCode());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.ILLEGAL_ARGUMENT.getCode());
    }

}