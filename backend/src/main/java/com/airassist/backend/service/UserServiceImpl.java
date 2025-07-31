package com.airassist.backend.service;

import com.airassist.backend.exceptions.user.DuplicateUserException;
import com.airassist.backend.exceptions.user.UserNotFoundException;
import com.airassist.backend.model.User;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.utils.UserUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RandomPasswordGeneratorService randomPasswordGenerator;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, RandomPasswordGeneratorService randomPasswordGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.randomPasswordGenerator = randomPasswordGenerator;
    }

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
    public User addUser(User user) throws DuplicateUserException {
        String email = user.getEmail();
        logger.info("UserService - Attempting to add user: {}", email);
        checkForDuplicateEmail(email);
        user.setPassword(randomPasswordGenerator.generateRandomPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) throws UserNotFoundException, DuplicateUserException {
        UUID id = user.getId();
        logger.info("UserService - Attempting to update user: {}", id);

        /*Check for null values in non-nullable fields. This allows us to use the same dto for update and patch*/
        if(user.getEmail() == null) {
            logger.warn("Email cannot be null for user update");
            throw new IllegalArgumentException("Email cannot be null");
        }
        if(user.getUserDetails() != null && user.getUserDetails().getPhoneNumber() == null) {
            logger.warn("Phone number cannot be null for user update");
            throw new IllegalArgumentException("Phone number cannot be null");
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
        UserUtils.updateUserFields(user, userToUpdate);
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
        UserUtils.patchUserFields(user, userToPatch);
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

}
