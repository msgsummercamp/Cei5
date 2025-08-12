package com.airassist.backend.exception.auth;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class InvalidPasswordException extends Exception {
    public InvalidPasswordException() {
        super(ApiErrorMessages.INVALID_PASSWORD.getCode());
    }
}
