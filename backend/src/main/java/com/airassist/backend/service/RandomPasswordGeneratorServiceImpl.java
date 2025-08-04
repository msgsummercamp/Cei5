package com.airassist.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RandomPasswordGeneratorServiceImpl implements RandomPasswordGeneratorService{

    @Value("${random.password.api.url}")
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

    @Override
    public String generateRandomPassword(int length) throws JsonProcessingException {
        String url = apiUrl.replace("{}", String.valueOf(length));
        logger.info("Generating random password with length: {}", length);

        String reponse = restTemplate.getForObject(url, String.class);
        logger.info("Received response from airport API.");

        JsonNode root = objectMapper.readTree(reponse);

        return root.get("random_password").asText();
    }

    @Override
    public String generateRandomPassword() throws JsonProcessingException {
        return generateRandomPassword(12);
    }
}
