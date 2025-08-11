package com.airassist.backend.exception.cases;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class CaseNotFoundException extends RuntimeException {
    public CaseNotFoundException() {
        super(ApiErrorMessages.CASE_NOT_FOUND.getCode());
    }

}
