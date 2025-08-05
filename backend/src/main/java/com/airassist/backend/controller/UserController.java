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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id) throws UserNotFoundException {
        User user = userService.getUserById(id);
        UserResponseDTO response = userMapper.userToUserResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserDTO userDTO) throws DuplicateUserException, JsonProcessingException, PasswordApiException {
        User userToCreate = userMapper.userDTOToUser(userDTO);
        User createdUser = userService.addUser(userToCreate);
        UserResponseDTO response = userMapper.userToUserResponseDTO(createdUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToUpdate = userMapper.userDTOToUser(userDTO);
        userToUpdate.setId(id);
        User updatedUser = userService.updateUser(userToUpdate);
        UserResponseDTO response = userMapper.userToUserResponseDTO(updatedUser);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) throws UserNotFoundException, DuplicateUserException {
        User userToPatch = userMapper.userDTOToUser(userDTO);
        userToPatch.setId(id);
        User patchedUser = userService.patchUser(userToPatch);
        UserResponseDTO response = userMapper.userToUserResponseDTO(patchedUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) throws UserNotFoundException {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
