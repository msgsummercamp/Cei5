package com.airassist.backend.mapper;

import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserDetailsDTO;
import com.airassist.backend.model.Roles;
import com.airassist.backend.model.User;
import com.airassist.backend.model.UserDetails;
import com.airassist.backend.testObjects.TestUserFactory;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

class TestUserMapper {

    @Test
    void shouldMapUserToUserDTO_AllFields() {
        User user = TestUserFactory.createValidUser();
        UserDTO dto = UserMapper.INSTANCE.userToUserDTO(user);

        assertThat(dto, notNullValue());
        assertThat(dto.getEmail(), is("test@example.com"));
        assertThat(dto.getFirstName(), is("John"));
        assertThat(dto.getLastName(), is("Doe"));
        assertThat(dto.getRole(), is(Roles.USER));
        assertThat(dto.getUserDetails(), notNullValue());
        assertThat(dto.getUserDetails().getPhoneNumber(), is("+12345678901"));
        assertThat(dto.getUserDetails().getAddress(), is("123 Main St"));
        assertThat(dto.getUserDetails().getPostalCode(), is("12345"));
        assertThat(dto.getUserDetails().getBirthDate(), is(LocalDate.of(1990, 1, 1)));
    }

    @Test
    void shouldMapUserToUserDTO_NullUserDetails() {
        User user = TestUserFactory.createValidUser();
        user.setUserDetails(null);

        UserDTO dto = UserMapper.INSTANCE.userToUserDTO(user);

        assertThat(dto, notNullValue());
        assertThat(dto.getUserDetails(), nullValue());
    }

    @Test
    void shouldMapUserToUserDTO_NullInput() {
        UserDTO dto = UserMapper.INSTANCE.userToUserDTO(null);
        assertThat(dto, nullValue());
    }

    @Test
    void shouldMapUserDetailsToUserDetailsDTO_AllFields() {
        UserDetails userDetails = TestUserFactory.createValidUserDetails();
        UserDetailsDTO dto = UserMapper.INSTANCE.userDetailsToUserDetailsDTO(userDetails);

        assertThat(dto, notNullValue());
        assertThat(dto.getPhoneNumber(), is("+12345678901"));
        assertThat(dto.getAddress(), is("123 Main St"));
        assertThat(dto.getPostalCode(), is("12345"));
        assertThat(dto.getBirthDate(), is(LocalDate.of(1990, 1, 1)));
    }

    @Test
    void shouldMapUserDetailsToUserDetailsDTO_NullInput() {
        UserDetailsDTO dto = UserMapper.INSTANCE.userDetailsToUserDetailsDTO(null);
        assertThat(dto, nullValue());
    }

    @Test
    void shouldMapUserToUserDTO_EmptyFields() {
        UserDetails userDetails = TestUserFactory.createEmptyUserDetails();
        User user = TestUserFactory.createEmptyUser();

        UserDTO dto = UserMapper.INSTANCE.userToUserDTO(user);

        assertThat(dto, notNullValue());
        assertThat(dto.getEmail(), is(""));
        assertThat(dto.getFirstName(), is(""));
        assertThat(dto.getLastName(), is(""));
        assertThat(dto.getRole(), nullValue());
        assertThat(dto.getUserDetails(), notNullValue());
        assertThat(dto.getUserDetails().getPhoneNumber(), is(""));
        assertThat(dto.getUserDetails().getAddress(), is(""));
        assertThat(dto.getUserDetails().getPostalCode(), is(""));
        assertThat(dto.getUserDetails().getBirthDate(), nullValue());
    }

    @Test
    void shouldMapUserDTOToUser_AllFields() {
        UserDTO userDTO = TestUserFactory.createUserDTO();
        User user = UserMapper.INSTANCE.userDTOToUser(userDTO);

        assertThat(user, notNullValue());
        assertThat(user.getEmail(), is("test@example.com"));
        assertThat(user.getFirstName(), is("John"));
        assertThat(user.getLastName(), is("Doe"));
        assertThat(user.getRole(), is(Roles.USER));
        assertThat(user.getUserDetails(), notNullValue());
        assertThat(user.getUserDetails().getPhoneNumber(), is("+12345678901"));
        assertThat(user.getUserDetails().getAddress(), is("123 Main St"));
        assertThat(user.getUserDetails().getPostalCode(), is("12345"));
        assertThat(user.getUserDetails().getBirthDate(), is(LocalDate.of(1990, 1, 1)));
    }

    @Test
    void shouldMapUserDTOToUser_NullInput() {
        User user = UserMapper.INSTANCE.userDTOToUser(null);
        assertThat(user, nullValue());
    }

    @Test
    void shouldMapUserDetailsDTOToUserDetails_AllFields() {
        UserDetailsDTO userDetailsDTO = TestUserFactory.createUserDetailsDTO();
        UserDetails userDetails = UserMapper.INSTANCE.userDetailsDTOToUserDetails(userDetailsDTO);

        assertThat(userDetails, notNullValue());
        assertThat(userDetails.getPhoneNumber(), is("+12345678901"));
        assertThat(userDetails.getAddress(), is("123 Main St"));
        assertThat(userDetails.getPostalCode(), is("12345"));
        assertThat(userDetails.getBirthDate(), is(LocalDate.of(1990, 1, 1)));
    }

    @Test
    void shouldMapUserDetailsDTOToUserDetails_NullInput() {
        UserDetails userDetails = UserMapper.INSTANCE.userDetailsDTOToUserDetails(null);
        assertThat(userDetails, nullValue());
    }
}