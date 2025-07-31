package com.airassist.backend.exception;

public class FontNotFoundException extends RuntimeException {
    public FontNotFoundException() {
        super("Font not found");
    }
}
