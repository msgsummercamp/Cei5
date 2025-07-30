package com.airassist.backend.service;

import com.airassist.backend.exceptions.user.DuplicateUserException;
import com.airassist.backend.exceptions.user.UserNotFoundException;
import com.airassist.backend.model.User;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.testObjects.TestUserFactory;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TestUserService {

    static UserRepository userRepository;
    static PasswordEncoder passwordEncoder;
    static RandomPasswordGeneratorService randomPasswordGenerator;
    static UserServiceImpl userService;

    @BeforeAll
    static void setup() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        randomPasswordGenerator = Mockito.mock(RandomPasswordGeneratorService.class);
        userService = new UserServiceImpl(userRepository, passwordEncoder, randomPasswordGenerator);

        Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("encoded");
        Mockito.when(randomPasswordGenerator.generateRandomPassword()).thenReturn("randomPass");
    }

    @Test
    void getUserByEmail_userExists_returnsUser() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserByEmail(user.getEmail());

        MatcherAssert.assertThat(result.isPresent(), is(true));
        MatcherAssert.assertThat(result.get().getEmail(), is(user.getEmail()));
    }

    @Test
    void getUserByEmail_userDoesNotExist_returnsEmpty() {
        Mockito.when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserByEmail("notfound@example.com");

        MatcherAssert.assertThat(result.isPresent(), is(false));
    }

    @Test
    void addUser_duplicateEmail_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThrows(DuplicateUserException.class, () -> userService.addUser(user));
    }

    @Test
    void addUser_validUser_savesUser() throws DuplicateUserException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        User saved = userService.addUser(user);

        MatcherAssert.assertThat(saved, is(notNullValue()));
        MatcherAssert.assertThat(saved.getEmail(), is(user.getEmail()));
    }

    @Test
    void updateUser_userNotFound_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.updateUser(user));
    }

    @Test
    void updateUser_nullPhoneNumber_throwsException() {
        User user = TestUserFactory.createValidUser();
        user.getUserDetails().setPhoneNumber(null);
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(user));
    }

    @Test
    void updateUser_validUser_updatesUser() throws UserNotFoundException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        User updated = userService.updateUser(user);

        MatcherAssert.assertThat(updated, is(notNullValue()));
        MatcherAssert.assertThat(updated.getEmail(), is(user.getEmail()));
    }

    @Test
    void patchUser_userNotFound_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.patchUser(user));
    }

    @Test
    void patchUser_validUser_patchesUser() throws UserNotFoundException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        User patched = userService.patchUser(user);

        MatcherAssert.assertThat(patched, is(notNullValue()));
        MatcherAssert.assertThat(patched.getEmail(), is(user.getEmail()));
    }

    @Test
    void patchUser_onlyPassword_patchesPassword() throws Exception {
        User original = TestUserFactory.createValidUser();
        User patch = new User();
        patch.setEmail(original.getEmail());
        patch.setPassword("newPassword123");

        Mockito.when(userRepository.findByEmail(original.getEmail())).thenReturn(Optional.of(original));
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Mockito.when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword");

        User result = userService.patchUser(patch);

        MatcherAssert.assertThat(result.getPassword(), is("encodedNewPassword"));
        MatcherAssert.assertThat(result.getEmail(), is(original.getEmail()));
        MatcherAssert.assertThat(result.getFirstName(), is(original.getFirstName()));
    }

    @Test
    void deleteUser_userNotFound_throwsException() {
        Mockito.when(userRepository.existsByEmail("notfound@example.com")).thenReturn(true);

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser("notfound@example.com"));
    }

    @Test
    void deleteUser_userExists_deletesUser() throws UserNotFoundException {
        Mockito.when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        userService.deleteUser("test@example.com");

        Mockito.verify(userRepository).deleteByEmail("test@example.com");
    }
}