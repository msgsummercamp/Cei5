package com.airassist.backend.exception.user;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class PasswordApiException extends Exception {
    public PasswordApiException() {
        super(ApiErrorMessages.PASSWORD_API_ERROR.getCode());
    }
}
