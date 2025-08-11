package com.airassist.backend.exception.airport;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class InvalidAirportDetailsException extends RuntimeException {
    public InvalidAirportDetailsException() {
        super(ApiErrorMessages.INVALID_AIRPORT_DETAILS.getCode());
    }
}
