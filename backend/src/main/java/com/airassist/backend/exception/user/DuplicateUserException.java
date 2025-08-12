package com.airassist.backend.exception.user;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class DuplicateUserException extends Exception {
    public DuplicateUserException() {
        super(ApiErrorMessages.DUPLICATE_USER.getCode());
    }
}
