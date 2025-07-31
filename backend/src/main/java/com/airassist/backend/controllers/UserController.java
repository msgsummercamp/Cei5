package com.airassist.backend.controllers;

import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserResponseDTO;
import com.airassist.backend.exceptions.user.DuplicateUserException;
import com.airassist.backend.exceptions.user.UserNotFoundException;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id) throws UserNotFoundException {
        User user = userService.getUserById(id);
        UserResponseDTO response = UserMapper.INSTANCE.userToUserResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserDTO userDTO) throws DuplicateUserException {
        User userToCreate = UserMapper.INSTANCE.userDTOToUser(userDTO);
        User createdUser = userService.addUser(userToCreate);
        UserResponseDTO response = UserMapper.INSTANCE.userToUserResponseDTO(createdUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToUpdate = UserMapper.INSTANCE.userDTOToUser(userDTO);
        userToUpdate.setId(id);
        User updatedUser = userService.updateUser(userToUpdate);
        UserResponseDTO response = UserMapper.INSTANCE.userToUserResponseDTO(updatedUser);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToPatch = UserMapper.INSTANCE.userDTOToUser(userDTO);
        userToPatch.setId(id);
        User patchedUser = userService.patchUser(userToPatch);
        UserResponseDTO response = UserMapper.INSTANCE.userToUserResponseDTO(patchedUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) throws UserNotFoundException {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
