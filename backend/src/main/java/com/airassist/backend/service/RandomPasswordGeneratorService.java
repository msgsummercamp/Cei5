package com.airassist.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;

/**
 * Service interface for generating random passwords.
 */
public interface RandomPasswordGeneratorService {

    /**
     * Generates a random password with the specified length using an external API.
     *
     * @param length the length of the password to generate
     * @return a randomly generated password as a String
     * @throws JsonProcessingException if there is an error processing the JSON response
     */
    String generateRandomPassword(int length) throws JsonProcessingException;

    /**
     * Generates a random password with a default length of 12 characters using an external API.
     *
     * @return a randomly generated password as a String
     * @throws JsonProcessingException if there is an error processing the JSON response
     */
    String generateRandomPassword() throws JsonProcessingException;
}
