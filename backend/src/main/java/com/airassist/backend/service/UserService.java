package com.airassist.backend.service;

import com.airassist.backend.exceptions.user.DuplicateUserException;
import com.airassist.backend.exceptions.user.UserNotFoundException;
import com.airassist.backend.model.User;

import java.util.Optional;

/**
 * Service interface for managing {@link User} entities.
 * Provides methods for CRUD operations and user retrieval.
 */
public interface UserService {

    /**
     * Retrieves a user by their email address.
     *
     * @param email the email of the user
     * @return an {@code Optional} containing the user if found, or empty if not
     */
    Optional<User> getUserByEmail(String email);

    /**
     * Add a user to the repository.
     *
     * @param user the user to save
     * @return the saved user entity
     * @throws DuplicateUserException if a user with the same email already exists
     */
    User addUser(User user) throws DuplicateUserException;

    /**
     * Updates an existing user in the repository by their email.
     * Role and password are not updated.
     *
     * @param user the user to update
     * @return the updated user entity
     * @throws UserNotFoundException if the user with the given email does not exist
     * @throws IllegalArgumentException if the user's phone number is null
     */
    User updateUser(User user) throws UserNotFoundException;

    /**
     * Patches an existing user in the repository by their email.
     * This method allows partial updates to the user entity.
     * Email and role are not updated.
     *
     * @param user the user containing new values
     * @return the patched user entity
     * @throws UserNotFoundException if the user with the given email does not exist
     */
    User patchUser(User user) throws UserNotFoundException;

    /**
     * Retrieves a user by their unique identifier: the email address.
     *
     * @param email the email of the user
     */
    void deleteUser(String email) throws UserNotFoundException;



}
