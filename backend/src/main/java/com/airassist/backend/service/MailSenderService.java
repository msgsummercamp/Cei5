package com.airassist.backend.service;

import jakarta.mail.MessagingException;


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
     * Sends an email telling the user that the entered case is valid.
     * @param recipient Recipient's email address.
     * @param caseId The ID of the case that was validated.
     * @throws MessagingException If there is an error sending the email.
     */
    void sendValidCaseEmail(String recipient, int caseId) throws MessagingException;

    /**
     * Sends an email with a generated password.
     * @param recipient Recipient's email address.
     * @param generatedPassword The generated password to be sent.
     * @throws MessagingException If there is an error sending the email.
     */
    void sendGeneratedPasswordEmail(String recipient, String generatedPassword) throws MessagingException;

    /**
     * Sends an email with a contract link.
     * @param recipient Recipient's email address.
     * @param contractLink The link to the contract to be sent.
     * @throws MessagingException If there is an error sending the email.
     */
    void sendContractLink(String recipient, String contractLink) throws MessagingException;
}
