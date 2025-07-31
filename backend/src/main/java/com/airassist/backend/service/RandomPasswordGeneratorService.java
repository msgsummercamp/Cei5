package com.airassist.backend.service;

/**
 * Service interface for generating random passwords.
 */
public interface RandomPasswordGeneratorService {

    /**
     * Generates a random password with the specified length.
     * Contains a mix of uppercase letters, lowercase letters, digits, and special characters.
     *
     * @param length the length of the password to generate
     * @return a randomly generated password as a String
     */
    String generateRandomPassword(int length);

    /**
     * Generates a random password with a default length of 12 characters.
     * Contains a mix of uppercase letters, lowercase letters, digits, and special characters.
     *
     * @return a randomly generated password as a String
     */
    String generateRandomPassword();
}
