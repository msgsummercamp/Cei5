package com.airassist.backend.testObjects;

import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserDetailsDTO;
import com.airassist.backend.model.Roles;
import com.airassist.backend.model.User;
import com.airassist.backend.model.UserDetails;

import java.time.LocalDate;
import java.util.UUID;

public class TestUserFactory {

    public static UserDetails createValidUserDetails() {
        return new UserDetails(
                UUID.randomUUID(),
                "+12345678901",
                "123 Main St",
                "12345",
                LocalDate.of(1990, 1, 1)
        );
    }

    public static UserDetails createEmptyUserDetails() {
        return new UserDetails(
                UUID.randomUUID(),
                "",
                "",
                "",
                null
        );
    }

    public static User createValidUser() {
        return new User(
                UUID.randomUUID(),
                "test@example.com",
                "password123",
                "John",
                "Doe",
                Roles.USER,
                createValidUserDetails(),
                null,
                null,
                false
        );
    }

    public static User createEmptyUser() {
        return new User(
                UUID.randomUUID(),
                "",
                "",
                "",
                "",
                null,
                createEmptyUserDetails(),
                null,
                null,
                false
        );
    }

    public static User createUserWithNullDetails() {
        return new User(
                UUID.randomUUID(),
                "nulluser@example.com",
                "password123",
                "Jane",
                "Smith",
                Roles.USER,
                null,
                null,
                null,
                false
        );
    }

    public static UserDetailsDTO createUserDetailsDTO() {
        UserDetailsDTO dto = new UserDetailsDTO();
        dto.setPhoneNumber("+12345678901");
        dto.setAddress("123 Main St");
        dto.setPostalCode("12345");
        dto.setBirthDate(LocalDate.of(1990, 1, 1));
        return dto;
    }

    public static UserDTO createUserDTO() {
        UserDTO dto = new UserDTO();
        dto.setEmail("test@example.com");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setRole(Roles.USER);
        dto.setUserDetails(createUserDetailsDTO());
        return dto;
    }
}