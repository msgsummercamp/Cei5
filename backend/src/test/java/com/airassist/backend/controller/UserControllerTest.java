package com.airassist.backend.controller;

import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserResponseDTO;
import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.PasswordApiException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserController userController;

    @Test
    void getAllUsers_WhenUsersExist_ShouldReturnList() throws UserNotFoundException {
        User user = new User();
        UserResponseDTO dto = new UserResponseDTO();
        when(userService.getAllUsers()).thenReturn(List.of(user));
        when(userMapper.userToUserResponseDTO(user)).thenReturn(dto);

        ResponseEntity<List<UserResponseDTO>> response = userController.getAllUsers();

        assertEquals(1, response.getBody().size());
        assertEquals(dto, response.getBody().get(0));
    }

    @Test
    void getAllEmployees_WhenEmployeesExist_ShouldReturnList() throws UserNotFoundException {
        User employee = new User();
        UserResponseDTO dto = new UserResponseDTO();

        when(userService.getAllEmployees()).thenReturn(List.of(employee));
        when(userMapper.userToUserResponseDTO(employee)).thenReturn(dto);

        ResponseEntity<List<UserResponseDTO>> response = userController.getAllEmployees();

        assertEquals(1, response.getBody().size());
        assertEquals(dto, response.getBody().get(0));
    }

    @Test
    void getUserById_WhenUserExists_ShouldReturnUserResponseDTO() throws UserNotFoundException {
        UUID id = UUID.randomUUID();
        User user = new User();
        UserResponseDTO dto = new UserResponseDTO();
        when(userService.getUserById(id)).thenReturn(user);
        when(userMapper.userToUserResponseDTO(user)).thenReturn(dto);

        ResponseEntity<UserResponseDTO> response = userController.getUserById(id);

        assertEquals(dto, response.getBody());
    }

    @Test
    void createUser_ValidInput_ShouldReturnCreatedUser() throws DuplicateUserException, PasswordApiException, Exception {
        UserDTO userDTO = new UserDTO();
        User user = new User();
        User createdUser = new User();
        UserResponseDTO dto = new UserResponseDTO();

        when(userMapper.userDTOToUser(userDTO)).thenReturn(user);
        when(userService.addUser(user)).thenReturn(createdUser);
        when(userMapper.userToUserResponseDTO(createdUser)).thenReturn(dto);

        ResponseEntity<UserResponseDTO> response = userController.createUser(userDTO);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
    }

    @Test
    void patchUser_ValidInput_ShouldReturnPatchedUser() throws UserNotFoundException, DuplicateUserException {
        UUID id = UUID.randomUUID();
        UserDTO userDTO = new UserDTO();
        User userToPatch = new User();
        userToPatch.setId(id);
        User patchedUser = new User();
        UserResponseDTO dto = new UserResponseDTO();

        when(userMapper.userDTOToUser(userDTO)).thenReturn(userToPatch);
        when(userService.patchUser(userToPatch)).thenReturn(patchedUser);
        when(userMapper.userToUserResponseDTO(patchedUser)).thenReturn(dto);

        ResponseEntity<UserResponseDTO> response = userController.patchUser(id, userDTO);

        assertEquals(dto, response.getBody());
    }

    @Test
    void deleteUser_WhenUserExists_ShouldReturnNoContent() throws UserNotFoundException {
        UUID id = UUID.randomUUID();

        ResponseEntity<Void> response = userController.deleteUser(id);

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(userService).deleteUser(id);
    }
}
