package com.airassist.backend.service;

import jakarta.mail.MessagingException;

import java.util.Map;


/** * Service for handling email sending operations.
 * It prepares the email session, creates the message and sends the email.
 */
public interface MailSenderService {

    /**
     * Sends an email with the specified parameters.
     * @param recipient Recipient's email address.
     * @param subject Subject of the email.
     * @param htmlBody the HTML page containing the email body.
     * @throws MessagingException If there is an error sending the email.
     */
    void sendMessage(String recipient, String subject, String htmlBody) throws MessagingException;

    /**
     * Sends an email using Thymeleaf template by calling the sendMessage() function.
     * @param recipient Recipient's email address.
     * @param subject Subject of the email.
     * @param templateModel Map containing the variables to be used in the Thymeleaf template.
     * @throws MessagingException If there is an error sending the email.
     */
    void sendMessageUsingThymesleaf(String recipient, String subject, Map<String, Object> templateModel) throws MessagingException;

}
