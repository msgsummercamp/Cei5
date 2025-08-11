package com.airassist.backend.exception.user;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class UserNotFoundException extends Exception {
    public UserNotFoundException() {
        super(ApiErrorMessages.USER_NOT_FOUND.getCode());
    }
}
