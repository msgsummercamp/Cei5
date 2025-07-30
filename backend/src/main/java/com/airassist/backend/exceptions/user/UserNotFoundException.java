package com.airassist.backend.exceptions.user;

public class UserNotFoundException extends Exception {
    public UserNotFoundException() {
        super("User does not exist");
    }
}
