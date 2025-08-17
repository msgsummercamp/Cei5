package com.airassist.backend.service.impl;

import com.airassist.backend.exception.user.PasswordApiException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import com.airassist.backend.service.RandomPasswordGeneratorService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;

@Service
public class RandomPasswordGeneratorServiceImpl implements RandomPasswordGeneratorService {

    @Value("${password.generator.api.url}")
    private String apiUrl;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(RandomPasswordGeneratorServiceImpl.class);

    @PostConstruct
    void init() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
        logger.info("RandomPasswordGeneratorService initialized with API URL: {}", apiUrl);
    }

    /**
     * Generates a random password of the specified length using an external API.
     *
     * @param length the desired length of the password
     * @return a randomly generated password
     * @throws JsonProcessingException if there is an error processing the JSON response
     * @throws PasswordApiException if there is an error calling the password generator API
     */
    @Override
    public String generateRandomPassword(int length) throws JsonProcessingException, PasswordApiException {
        String url = apiUrl.replace("{}", String.valueOf(length));
        logger.info("Generating random password with length: {}", length);

        String response = null;
        try {
            response = restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            logger.error("Error while calling password generator API: {}", e.getMessage());
            throw new PasswordApiException();
        }

        logger.info("Received response from password generator API.");

        JsonNode root = objectMapper.readTree(response);
        if(!root.has("password") || root.get("password").isNull()) {
            throw new PasswordApiException();
        }

        return root.get("password").asText();
    }

    /**
     * Generates a random password of default length (12 characters).
     *
     * @return a randomly generated password
     * @throws JsonProcessingException if there is an error processing the JSON response
     * @throws PasswordApiException if there is an error calling the password generator API
     */
    @Override
    public String generateRandomPassword() throws JsonProcessingException, PasswordApiException {
        return generateRandomPassword(12);
    }
}
