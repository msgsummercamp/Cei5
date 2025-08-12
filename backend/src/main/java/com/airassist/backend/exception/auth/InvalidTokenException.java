package com.airassist.backend.exception.auth;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class InvalidTokenException extends Exception {
    public InvalidTokenException() {
        super(ApiErrorMessages.INVALID_TOKEN.getCode());
    }
}
