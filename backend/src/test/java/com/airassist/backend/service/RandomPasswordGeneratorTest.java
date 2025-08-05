package com.airassist.backend.service;

import com.airassist.backend.service.impl.RandomPasswordGeneratorServiceImpl;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class RandomPasswordGeneratorTest {

    private static RandomPasswordGeneratorService randomPassGenerator;

    @BeforeAll
    public static void setUp() {
        randomPassGenerator = new RandomPasswordGeneratorServiceImpl();
    }

    @Test
    void generatesPasswordWithDefaultLength() {
        String password = randomPassGenerator.generateRandomPassword();
        assertThat(password, notNullValue());
        assertThat(password.length(), is(12));
    }

    @Test
    void generatesPasswordWithCustomLength() {
        int length = 20;
        String password = randomPassGenerator.generateRandomPassword(length);
        assertThat(password, notNullValue());
        assertThat(password.length(), is(length));
    }

    @Test
    void generatedPasswordContainsOnlyAllowedSymbols() {
        String symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        String password = randomPassGenerator.generateRandomPassword(50);
        for (char c : password.toCharArray()) {
            assertThat("Password contains invalid character: " + c, symbols.indexOf(c), greaterThanOrEqualTo(0));
        }
    }

    @Test
    void generatesDifferentPasswords() {
        String password1 = randomPassGenerator.generateRandomPassword();
        String password2 = randomPassGenerator.generateRandomPassword();
        assertThat(password1, not(equalTo(password2)));
    }
}