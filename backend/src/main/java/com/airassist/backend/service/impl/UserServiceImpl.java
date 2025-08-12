package com.airassist.backend.service.impl;

import com.airassist.backend.exception.user.DuplicateUserException;
import com.airassist.backend.exception.user.PasswordApiException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.model.User;
import com.airassist.backend.model.UserDetails;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.service.RandomPasswordGeneratorService;
import com.airassist.backend.service.UserService;
import com.airassist.backend.validator.UserValidator;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RandomPasswordGeneratorService randomPasswordGenerator;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Override
    public User getUserById(UUID id) throws UserNotFoundException {
        logger.info("UserService - Fetching user with ID: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", id);
            throw new UserNotFoundException();
        }
        return user.get();
    }

    @Override
    public User getUserByEmail(String email) throws UserNotFoundException {
        logger.info("UserService - Fetching user with email: {}", email);
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new UserNotFoundException();
        }
        return user.get();
    }

    @Override
    public User addUser(User user) throws DuplicateUserException, JsonProcessingException, PasswordApiException {
        String email = user.getEmail();
        logger.info("UserService - Attempting to add user: {}", email);
        checkForDuplicateEmail(email);
        user.setPassword(randomPasswordGenerator.generateRandomPassword());
        if (user.getRole() == null) {
            user.setRole(Roles.USER);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setIsFirstLogin(true);
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) throws UserNotFoundException, DuplicateUserException {
        UUID id = user.getId();
        logger.info("UserService - Attempting to update user: {}", id);

        /*Check for null values in non-nullable fields. This allows us to use the same dto for update and patch*/
        if(!UserValidator.userIsValidForUpdate(user)) {
            logger.error("User with ID {} has invalid data for update", id);
            throw new IllegalArgumentException();
        }

        Optional<User> existingUserOpt = userRepository.findById(id);
        if (existingUserOpt.isEmpty()) {
            logger.warn("User with ID {} not found for update", id);
            throw new UserNotFoundException();
        }
        checkForDuplicateEmail(user.getEmail());
        User userToUpdate = existingUserOpt.get();
        if(user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        updateUserFields(user, userToUpdate);
        return userRepository.save(userToUpdate);
    }

    @Override
    public User patchUser(User user) throws UserNotFoundException, DuplicateUserException {
        UUID id = user.getId();
        logger.info("UserService - Attempting to patch user: {}", id);

        Optional<User> existingUserOpt = userRepository.findById(id);
        if (existingUserOpt.isEmpty()) {
            logger.warn("User with id {} not found for patch", id);
            throw new UserNotFoundException();
        }
        checkForDuplicateEmail(user.getEmail());
        User userToPatch = existingUserOpt.get();
        if(user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        patchUserFields(user, userToPatch);
        return userRepository.save(userToPatch);
    }

    @Override
    public void deleteUser(UUID id) throws UserNotFoundException {
        logger.info("UserService - Attempting to delete user with id: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found for deletion", id);
            throw new UserNotFoundException();
        }
        userRepository.deleteById(id);
    }

    private void checkForDuplicateEmail(String email) throws DuplicateUserException {
        if (userRepository.existsByEmail(email)) {
            logger.warn("User with email {} already exists", email);
            throw new DuplicateUserException();
        }
    }

    /**
     * Updates the fields of the target user with the values from the source user.
     * Does not update the email field to prevent email changes.
     * Does not update the role field to prevent role changes.
     * It also updates the UserDetails associated with the user.
     *
     * @param source the source user containing updated fields
     * @param target the target user to be updated
     */
    private void updateUserFields(User source, User target) {
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setPassword(source.getPassword());
        updateUserDetails(source.getUserDetails(), target.getUserDetails());
    }

    /**
     * Updates the fields of the target UserDetails with the values from the source UserDetails.
     *
     * @param source the source UserDetails containing updated fields
     * @param target the target UserDetails to be updated
     */
    private void updateUserDetails(UserDetails source, UserDetails target) {
        target.setAddress(source.getAddress());
        target.setPostalCode(source.getPostalCode());
        target.setPhoneNumber(source.getPhoneNumber());
        target.setBirthDate(source.getBirthDate());
    }

    /**
     * Patches the target user with the values from the source user.
     * This method allows partial updates to a user.
     * It updates only the fields that are not null in the source user.
     *
     * @param source the source user containing new values
     * @param target the target user to be patched
     */
    private void patchUserFields(User source, User target) {
        if (source.getFirstName() != null) target.setFirstName(source.getFirstName());
        if (source.getLastName() != null) target.setLastName(source.getLastName());
        if (source.getPassword() != null) target.setPassword(source.getPassword());
        if (source.getUserDetails() != null) {
            patchUserDetails(source.getUserDetails(), target.getUserDetails());
        }
        if (source.getIsFirstLogin() != null) {
            target.setIsFirstLogin(source.getIsFirstLogin());
        }
    }

    /**
     * Patches the target UserDetails with the values from the source UserDetails.
     *
     * @param source the source UserDetails containing new values
     * @param target the target UserDetails to be patched
     */
    private void patchUserDetails(UserDetails source, UserDetails target) {
        if (source.getAddress() != null) target.setAddress(source.getAddress());
        if (source.getPostalCode() != null) target.setPostalCode(source.getPostalCode());
        if (source.getPhoneNumber() != null) target.setPhoneNumber(source.getPhoneNumber());
        if (source.getBirthDate() != null) target.setBirthDate(source.getBirthDate());
    }

    /**
     * Retrieves all users from the repository.
     * @return List of all users
     * @throws UserNotFoundException
     */
    public List<User> getAllUsers() throws UserNotFoundException {
        logger.info("UserService - Fetching all users");
        List<User> users = userRepository.findAll();

        if(users.isEmpty()) {
            logger.warn("Users not found.");
            throw new UserNotFoundException();
        }

        return users;
    }

    /**
     * Retrieves all employees from the repository.
     * @return List of all employees with the specified role
     * @throws UserNotFoundException
     */
    public List<User> getAllEmployees() throws UserNotFoundException {
        logger.info("UserService - Fetching all employees");
        List<User> employees = userRepository.findAllEmployees(Roles.EMPLOYEE);

        if(employees.isEmpty()) {
            logger.warn("Employee not found.");
            throw new UserNotFoundException();
        }

        return employees;
    }
}
