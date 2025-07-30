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
    public Optional<User> getUserByEmail(String email) {
        logger.info("UserService - Fetching user with email: {}", email);
        return userRepository.findByEmail(email);
    }

    @Override
    public User addUser(User user) throws DuplicateUserException {
        logger.info("UserService - Attempting to add user: {}", user.getEmail());
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("User with email {} already exists", user.getEmail());
            throw new DuplicateUserException();
        }
        user.setPassword(randomPasswordGenerator.generateRandomPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) throws UserNotFoundException {
        logger.info("UserService - Attempting to update user: {}", user.getEmail());

        /* This check is here to ensure the phone number (not nullable database field) is not null.
        It enables us to use the same DTO's for both update and patch operations.*/
        if(user.getUserDetails() != null && user.getUserDetails().getPhoneNumber() == null) {
            logger.warn("Phone number cannot be null for user update");
            throw new IllegalArgumentException("Phone number cannot be null");
        }

        Optional<User> existingUserOpt = userRepository.findByEmail(user.getEmail());
        if (existingUserOpt.isEmpty()) {
            logger.warn("User with email {} not found for update", user.getEmail());
            throw new UserNotFoundException();
        }
        User userToUpdate = existingUserOpt.get();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        UserUtils.updateUserFields(user, userToUpdate);
        return userRepository.save(userToUpdate);
    }

    @Override
    public User patchUser(User user) throws UserNotFoundException {
        logger.info("UserService - Attempting to patch user: {}", user.getEmail());

        Optional<User> existingUserOpt = userRepository.findByEmail(user.getEmail());
        if (existingUserOpt.isEmpty()) {
            logger.warn("User with email {} not found for patch", user.getEmail());
            throw new UserNotFoundException();
        }
        User userToPatch = existingUserOpt.get();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        UserUtils.patchUserFields(user, userToPatch);
        return userRepository.save(userToPatch);
    }

    @Override
    public void deleteUser(String email) throws UserNotFoundException {
        logger.info("UserService - Attempting to delete user with email: {}", email);
        if (userRepository.existsByEmail(email)) {
            logger.warn("User with email {} not found for deletion", email);
            throw new UserNotFoundException();
        }
        userRepository.deleteByEmail(email);
    }
}
