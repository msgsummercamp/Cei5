package com.airassist.backend.exception.document;

import com.airassist.backend.model.enums.ApiErrorMessages;

public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException() {
        super(ApiErrorMessages.DOCUMENT_NOT_FOUND.getCode());
    }
}
