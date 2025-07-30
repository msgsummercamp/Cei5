package com.airassist.backend.service;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Properties;


/** * Service for handling email sending operations.
 * It prepares the email session, creates the message and sends the email.
 */
@Service
public class MailSenderService {
    @Value("${mail.smtp.host}")
    private String smtpHost;

    @Value("${mail.smtp.port}")
    private String smtpPort;

    @Value("${mail.smtp.ssl.enable}")
    private String sslEnable;

    @Value("${mail.smtp.auth}")
    private String authEnable;

    @Value("${mail.username}")
    private String username;

    @Value("${mail.password}")
    private String password;

    /**
     * Creates a new email message with the specified parameters.
     * @param recipient Recipient's email address.
     * @param subject Subject of the email.
     * @param body Body content of the email.
     * @param session Email session recipient use for creating the message.
     * @return A Message object representing the email.
     * @throws MessagingException If there is an error creating the message.
     */
    public Message createMessage(String recipient, String subject, String body, Session session) throws MessagingException {
        Message message = new MimeMessage(session);

        message.setFrom(new InternetAddress(username));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));
        message.setSubject(subject);
        message.setText(body);

        return message;
    }

    /**
     * Prepares the email session with the necessary properties.
     * @return Session object configured with SMTP properties.
     */
    public Session prepareSession() {
        Properties properties = new Properties();

        properties.put("mail.username", username);
        properties.put("mail.password", password);
        properties.put("mail.smtp.host", smtpHost);
        properties.put("mail.smtp.port", smtpPort);
        properties.put("mail.smtp.auth", authEnable);
        properties.put("mail.smtp.starttls.enable", sslEnable);

        return Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }

        });
    }

    public void sendEmail(String to, String subject, String body) throws MessagingException {
        Transport.send(createMessage(to, subject, body, prepareSession()));
    }
}