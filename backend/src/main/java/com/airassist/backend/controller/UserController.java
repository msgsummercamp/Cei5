package com.airassist.backend.controller;

import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserResponseDTO;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.PasswordApiException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    /**
     * UserController is responsible for handling user-related requests.
     * It provides endpoints to create, update, delete, and retrieve users.
     * The controller uses UserService for business logic and UserMapper for DTO conversions.
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() throws UserNotFoundException {
        List<User> users = userService.getAllUsers();
        List<UserResponseDTO> userResponseDTOs = users.stream()
                .map(userMapper::userToUserResponseDTO)
                .toList();
        return ResponseEntity.ok(userResponseDTOs);

    }

    /**
     * Retrieves a user by their ID.
     * @param id the UUID of the user to retrieve
     * @return ResponseEntity containing UserResponseDTO if found, or 404 Not Found if not
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id) throws UserNotFoundException {
        User user = userService.getUserById(id);
        UserResponseDTO response = userMapper.userToUserResponseDTO(user);
        return ResponseEntity.ok(response);
    }
    /**
     * Retrieves all employees.
     * @return ResponseEntity containing a list of UserResponseDTOs representing employees
     * @throws UserNotFoundException if no employees are found
     */
    @GetMapping("/employees")
    public ResponseEntity<List<UserResponseDTO>> getAllEmployees() throws UserNotFoundException {
        List<User> employees = userService.getAllEmployees();
        List<UserResponseDTO> employeeResponseDTOs = employees.stream()
                .map(userMapper::userToUserResponseDTO)
                .toList();
        return ResponseEntity.ok(employeeResponseDTOs);
    }

    /**
     * Creates a new user.
     * @param userDTO the UserDTO containing user details
     * @return ResponseEntity containing the created UserResponseDTO
     * @throws DuplicateUserException if a user with the same email already exists
     * @throws JsonProcessingException if there is an error processing JSON data
     * @throws PasswordApiException if there is an error with the password API
     */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserDTO userDTO) throws DuplicateUserException, JsonProcessingException, PasswordApiException {
        User userToCreate = userMapper.userDTOToUser(userDTO);
        User createdUser = userService.addUser(userToCreate);
        UserResponseDTO response = userMapper.userToUserResponseDTO(createdUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Updates an existing user.
     * @param id the UUID of the user to update
     * @param userDTO the UserDTO containing updated user details
     * @return ResponseEntity containing the updated UserResponseDTO
     * @throws UserNotFoundException if the user with the given ID does not exist
     * @throws DuplicateUserException if a user with the same email already exists
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToUpdate = userMapper.userDTOToUser(userDTO);
        userToUpdate.setId(id);
        User updatedUser = userService.updateUser(userToUpdate);
        UserResponseDTO response = userMapper.userToUserResponseDTO(updatedUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Partially updates an existing user.
     * @param id the UUID of the user to patch
     * @param userDTO the UserDTO containing updated user details
     * @return ResponseEntity containing the patched UserResponseDTO
     * @throws UserNotFoundException if the user with the given ID does not exist
     * @throws DuplicateUserException if a user with the same email already exists
     */
    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToPatch = userMapper.userDTOToUser(userDTO);
        userToPatch.setId(id);
        User patchedUser = userService.patchUser(userToPatch);
        UserResponseDTO response = userMapper.userToUserResponseDTO(patchedUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a user by their ID.
     * @param id the UUID of the user to delete
     * @return ResponseEntity with no content if deletion is successful
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) throws UserNotFoundException {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
