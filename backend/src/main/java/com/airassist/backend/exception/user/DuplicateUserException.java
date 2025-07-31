package com.airassist.backend.exception.user;

public class DuplicateUserException extends Exception {
    public DuplicateUserException() {
        super("A user with this email already exists");
    }
}
