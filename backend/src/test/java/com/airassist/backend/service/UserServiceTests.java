package com.airassist.backend.service;

import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.User;
import com.airassist.backend.model.UserDetails;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.service.impl.UserServiceImpl;
import com.airassist.backend.validator.UserValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RandomPasswordGeneratorService randomPasswordGenerator;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void getUserById_WhenUserDoesNotExist_ThrowsExceptionUserNotFound() {
        UUID id = UUID.randomUUID();
        Mockito.when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(id));
    }

    @Test
    void getUserById_WhenUserExists_ReturnUser() throws UserNotFoundException {
        UUID userId = UUID.randomUUID();
        User expectedUser = new User();
        expectedUser.setId(userId);
        expectedUser.setEmail("test@test.com");
        expectedUser.setPassword("password");

        when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));

        User actualUser = userService.getUserById(userId);
        assertEquals(expectedUser, actualUser);
    }

    @Test
    void getUserByEmail_WhenUserDoesNotExist_ThrowsExceptionUserNotFound() {
        String email = "test@test.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> userService.getUserByEmail(email));
    }

    @Test
    void getUserByEmail_WhenUserExists_ReturnUser() throws UserNotFoundException {
        String email = "test@test.com";
        User expectedUser = new User();
        expectedUser.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(expectedUser));

        User actualUser = userService.getUserByEmail(email);
        assertEquals(expectedUser, actualUser);
    }

    @Test
    void addUser_WhenEmailAlreadyExists_ShouldThrowDuplicateUserException() {
        User user = new User();
        user.setEmail("test@test.com");

        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> userService.addUser(user));
    }

    @Test
    void addUser_WhenUserDoesNotExistAndRoleNull_ShouldSaveUserWithDefaultRole() throws Exception {
        User user = new User();
        user.setEmail("test@test.com");
        user.setRole(null);

        String generatedPassword = "randomPass";
        String encodedPassword = "encodedRandomPass";

        lenient().when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn(generatedPassword);
        when(passwordEncoder.encode(generatedPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.addUser(user);

        assertNotNull(savedUser);
        assertEquals(Roles.USER, savedUser.getRole());
        assertEquals(encodedPassword, savedUser.getPassword());
        assertTrue(savedUser.getIsFirstLogin());
    }

    @Test
    void addUser_WhenRoleProvided_ShouldKeepProvidedRole() throws Exception {
        User user = new User();
        user.setEmail("test@test.com");
        user.setRole(Roles.ADMIN);

        String generatedPassword = "randomPass";
        String encodedPassword = "encodedRandomPass";

        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(randomPasswordGenerator.generateRandomPassword()).thenReturn(generatedPassword);
        when(passwordEncoder.encode(generatedPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.addUser(user);

        assertEquals(Roles.ADMIN, savedUser.getRole());
        assertEquals(encodedPassword, savedUser.getPassword());
        assertTrue(savedUser.getIsFirstLogin());
    }

    @Test
    void updateUser_WhenUserDataInvalid_ShouldThrowIllegalArgumentException() {
        User user = new User();
        user.setId(UUID.randomUUID());

        try (MockedStatic<UserValidator> mocked = Mockito.mockStatic(UserValidator.class)) {
            mocked.when(() -> UserValidator.userIsValidForUpdate(user)).thenReturn(false);

            assertThrows(IllegalArgumentException.class, () -> userService.updateUser(user));
        }
    }

    @Test
    void updateUser_WhenUserNotFound_ShouldThrowUserNotFoundException() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);

        try (MockedStatic<UserValidator> mocked = Mockito.mockStatic(UserValidator.class)) {
            mocked.when(() -> UserValidator.userIsValidForUpdate(user)).thenReturn(true);
            when(userRepository.findById(id)).thenReturn(Optional.empty());

            assertThrows(UserNotFoundException.class, () -> userService.updateUser(user));
        }
    }

    @Test
    void updateUser_WhenEmailAlreadyExists_ShouldThrowDuplicateUserException() {
        UUID id = UUID.randomUUID();
        User inputUser = new User();
        inputUser.setId(id);
        inputUser.setEmail("test@test.com");

        User existingUser = new User();
        existingUser.setId(id);
        existingUser.setUserDetails(new UserDetails());

        try (MockedStatic<UserValidator> mocked = Mockito.mockStatic(UserValidator.class)) {
            mocked.when(() -> UserValidator.userIsValidForUpdate(inputUser)).thenReturn(true);

            when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
            when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

            assertThrows(DuplicateUserException.class, () -> userService.updateUser(inputUser));
        }
    }

    @Test
    void updateUser_WhenPasswordProvided_ShouldEncodeAndSave() throws Exception {
        UUID id = UUID.randomUUID();
        User inputUser = new User();
        inputUser.setId(id);
        inputUser.setEmail("test@test.com");
        inputUser.setPassword("newPassword");
        inputUser.setUserDetails(new UserDetails());

        User existingUser = new User();
        existingUser.setId(id);
        existingUser.setEmail("test@test.com");
        existingUser.setPassword("oldPassword");
        existingUser.setUserDetails(new UserDetails());

        try (MockedStatic<UserValidator> mocked = Mockito.mockStatic(UserValidator.class)) {
            mocked.when(() -> UserValidator.userIsValidForUpdate(inputUser)).thenReturn(true);

            when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
            when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
            when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            User updatedUser = userService.updateUser(inputUser);

            assertEquals("encodedPassword", updatedUser.getPassword());
        }
    }

    @Test
    void updateUser_WhenPasswordIsNull_ShouldKeepExistingPassword() throws Exception {
        UUID id = UUID.randomUUID();

        User inputUser = new User();
        inputUser.setId(id);
        inputUser.setEmail("test@test.com");
        inputUser.setPassword(null);
        inputUser.setUserDetails(new UserDetails());

        User existingUser = new User();
        existingUser.setId(id);
        existingUser.setEmail("old@test.com");
        existingUser.setPassword("existingPassword");
        existingUser.setUserDetails(new UserDetails());

        try (MockedStatic<UserValidator> mocked = Mockito.mockStatic(UserValidator.class)) {
            mocked.when(() -> UserValidator.userIsValidForUpdate(inputUser)).thenReturn(true);

            when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
            when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User updatedUser = userService.updateUser(inputUser);

            assertEquals(null, updatedUser.getPassword());
            assertEquals("old@test.com", updatedUser.getEmail());
        }
    }

    @Test
    void patchUser_WhenUserNotFound_ShouldThrowUserNotFoundException() {
        UUID id = UUID.randomUUID();
        User inputUser = new User();
        inputUser.setId(id);

        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.patchUser(inputUser));
    }

    @Test
    void patchUser_WhenEmailAlreadyExists_ShouldThrowDuplicateUserException() {
        UUID id = UUID.randomUUID();
        User inputUser = new User();
        inputUser.setId(id);
        inputUser.setEmail("test@test.com");

        User existingUser = new User();
        existingUser.setId(id);

        when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> userService.patchUser(inputUser));
    }

    @Test
    void patchUser_WhenPasswordProvided_ShouldEncodeAndSave() throws Exception {
        UUID id = UUID.randomUUID();
        User inputUser = new User();
        inputUser.setId(id);
        inputUser.setEmail("test@test.com");
        inputUser.setPassword("newPassword");
        inputUser.setUserDetails(new UserDetails());

        User existingUser = new User();
        existingUser.setId(id);
        existingUser.setEmail("test@test.com");
        existingUser.setPassword("oldPassword");
        existingUser.setUserDetails(new UserDetails());

        UserServiceImpl spyService = Mockito.spy(userService);

        when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.patchUser(inputUser);

        assertEquals("encodedPassword", result.getPassword());
    }

    @Test
    void deleteUser_WhenUserDoesNotExist_ThrowExceptionUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(userId));
    }

    @Test
    void deleteUser_WhenUserExists_ShouldDeleteUser() throws UserNotFoundException {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setEmail("test@test.com");
        user.setPassword("password");
        user.setRole(Roles.USER);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setIsFirstLogin(false);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteUser(userId);
        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void getAllUsers_WhenUsersNotExist_ThrowsExceptionUserNotFound() {
        when(userRepository.findAll()).thenReturn(List.of());

        assertThrows(UserNotFoundException.class, () -> userService.getAllUsers());
    }

    @Test
    void getAllUsers_WhenUsersExist_ReturnListOfUsers() throws UserNotFoundException {
        User user1 = new User();
        user1.setEmail("test1@gmail.com");
        User user2 = new User();
        user2.setEmail("test2@gmail.com");

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        List<User> expectedUsers = userService.getAllUsers();
        assertEquals(2, expectedUsers.size());
    }

    @Test
    void getAllEmployees_WhenEmployeesNotExist_ThrowExceptionUserNotFound() {
        when(userRepository.findAllEmployees(Roles.EMPLOYEE)).thenReturn(List.of());
        assertThrows(UserNotFoundException.class, () -> userService.getAllEmployees());
    }

    @Test
    void getAllEmployees_WhenEmployeesExist_ReturnListOfEmployees() throws UserNotFoundException {
        User employee1 = new User();
        employee1.setEmail("test@test1.com");
        employee1.setRole(Roles.EMPLOYEE);
        User employee2 = new User();
        employee2.setEmail("test@test2.com");
        employee2.setRole(Roles.EMPLOYEE);

        when(userRepository.findAllEmployees(Roles.EMPLOYEE)).thenReturn(List.of(employee1, employee2));
        List<User> expectedEmployees = userService.getAllEmployees();
        assertEquals(2, expectedEmployees.size());
    }
}