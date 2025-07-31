package com.airassist.backend.service;

import org.springframework.stereotype.Service;

@Service
public class RandomPasswordGeneratorServiceImpl implements RandomPasswordGeneratorService{

    private final String SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    @Override
    public String generateRandomPassword(int length) {
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = (int) (Math.random() * SYMBOLS.length());
            password.append(SYMBOLS.charAt(randomIndex));
        }
        return password.toString();
    }

    @Override
    public String generateRandomPassword() {
        return generateRandomPassword(12);
    }
}
