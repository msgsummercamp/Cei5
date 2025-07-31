package com.airassist.backend.service;

import jakarta.mail.MessagingException;

import java.util.Map;


public interface MailSenderService {

    /**
     * Sends an email with the specified parameters.
     * @param recipient Recipient's email address.
     * @param subject Subject of the email.
     * @param body Body content of the email.
     * @throws MessagingException If there is an error sending the email.
     */
    void sendMessage(String recipient, String subject, String body) throws MessagingException;


    void sendMessageUsingThymesleaf(String recipient, String subject, Map<String, Object> templateModel) throws MessagingException;

}
