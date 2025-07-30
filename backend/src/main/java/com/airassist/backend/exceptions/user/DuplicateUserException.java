package com.airassist.backend.exceptions.user;

public class DuplicateUserException extends Exception {
    public DuplicateUserException() {
        super("A user with this email already exists");
    }
}
