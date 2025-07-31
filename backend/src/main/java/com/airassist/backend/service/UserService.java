package com.airassist.backend.service;

import com.airassist.backend.exceptions.user.DuplicateUserException;
import com.airassist.backend.exceptions.user.UserNotFoundException;
import com.airassist.backend.model.User;

import java.util.UUID;

/**
 * Service interface for managing {@link User} entities.
 * Provides methods for CRUD operations and user retrieval.
 */
public interface UserService {

    /**
     * Retrieves a user by their unique identifier.
     *
     * @param id the unique identifier of the user
     * @return the user entity if found
     * @throws UserNotFoundException if the user with the given ID does not exist
     */
    User getUserById(UUID id) throws UserNotFoundException;

    /**
     * Retrieves a user by their email address.
     *
     * @param email the email of the user
     * @return an {@code Optional} containing the user if found, or empty if not
     * @throws UserNotFoundException if the user with the given email does not exist
     */
    User getUserByEmail(String email) throws UserNotFoundException;

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
     * @throws DuplicateUserException if a user with the same email already exists
     */
    User updateUser(User user) throws UserNotFoundException, DuplicateUserException;

    /**
     * Patches an existing user in the repository by their email.
     * This method allows partial updates to the user entity.
     * Email and role are not updated.
     *
     * @param user the user containing new values
     * @return the patched user entity
     * @throws UserNotFoundException if the user with the given email does not exist
     * @throws DuplicateUserException if a user with the same email already exists
     */
    User patchUser(User user) throws UserNotFoundException, DuplicateUserException;

    /**
     * Retrieves a user by their unique identifier.
     *
     * @param id the unique identifier of the user
     */
    void deleteUser(UUID id) throws UserNotFoundException;



}
