package com.airassist.backend.service;

import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.User;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.testObjects.TestUserFactory;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TestUserService {

    private static UserRepository userRepository;
    private static PasswordEncoder passwordEncoder;
    private static RandomPasswordGeneratorService randomPasswordGenerator;
    private static UserServiceImpl userService;

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
    void getUserById_userExists_returnsUser() throws UserNotFoundException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        User result = userService.getUserById(user.getId());

        MatcherAssert.assertThat(result, is(notNullValue()));
        MatcherAssert.assertThat(result.getId(), is(user.getId()));
    }

    @Test
    void getUserById_userDoesNotExist_throwsException() {
        UUID id = UUID.randomUUID();
        Mockito.when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(id));
    }

    @Test
    void getUserByEmail_userExists_returnsUser() throws UserNotFoundException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        User result = userService.getUserByEmail(user.getEmail());

        MatcherAssert.assertThat(result, is(notNullValue()));
        MatcherAssert.assertThat(result.getEmail(), is(user.getEmail()));
    }

    @Test
    void getUserByEmail_userDoesNotExist_throwsException() {
        Mockito.when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserByEmail("notfound@example.com"));
    }

    @Test
    void addUser_duplicateEmail_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> userService.addUser(user));
    }

    @Test
    void addUser_validUser_savesUser() throws DuplicateUserException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        User saved = userService.addUser(user);

        MatcherAssert.assertThat(saved, is(notNullValue()));
        MatcherAssert.assertThat(saved.getEmail(), is(user.getEmail()));
    }

    @Test
    void updateUser_userNotFound_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.updateUser(user));
    }

    @Test
    void updateUser_nullPhoneNumber_throwsException() {
        User user = TestUserFactory.createValidUser();
        user.getUserDetails().setPhoneNumber(null);
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(user));
    }

    @Test
    void updateUser_duplicateEmail_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> userService.updateUser(user));
    }

    @Test
    void updateUser_validUser_updatesUser() throws UserNotFoundException, DuplicateUserException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        User updated = userService.updateUser(user);

        MatcherAssert.assertThat(updated, is(notNullValue()));
        MatcherAssert.assertThat(updated.getEmail(), is(user.getEmail()));
    }

    @Test
    void updateUser_nullEmail_throwsException() {
        User user = TestUserFactory.createValidUser();
        user.setEmail(null);
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(user));
    }

    @Test
    void patchUser_userNotFound_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.patchUser(user));
    }

    @Test
    void patchUser_duplicateEmail_throwsException() {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> userService.patchUser(user));
    }

    @Test
    void patchUser_validUser_patchesUser() throws UserNotFoundException, DuplicateUserException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        User patched = userService.patchUser(user);

        MatcherAssert.assertThat(patched, is(notNullValue()));
        MatcherAssert.assertThat(patched.getEmail(), is(user.getEmail()));
    }

    @Test
    void patchUser_onlyPassword_patchesPassword() throws Exception {
        User original = TestUserFactory.createValidUser();
        User patch = new User();
        patch.setId(original.getId());
        patch.setEmail(original.getEmail());
        patch.setPassword("newPassword123");

        Mockito.when(userRepository.findById(original.getId())).thenReturn(Optional.of(original));
        Mockito.when(userRepository.existsByEmail(original.getEmail())).thenReturn(false);
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Mockito.when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword");

        User result = userService.patchUser(patch);

        MatcherAssert.assertThat(result.getPassword(), is("encodedNewPassword"));
        MatcherAssert.assertThat(result.getEmail(), is(original.getEmail()));
        MatcherAssert.assertThat(result.getFirstName(), is(original.getFirstName()));
    }

    @Test
    void deleteUser_userNotFound_throwsException() {
        UUID id = UUID.randomUUID();
        Mockito.when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(id));
    }

    @Test
    void deleteUser_userExists_deletesUser() throws UserNotFoundException {
        User user = TestUserFactory.createValidUser();
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        userService.deleteUser(user.getId());

        Mockito.verify(userRepository).deleteById(user.getId());
    }
}