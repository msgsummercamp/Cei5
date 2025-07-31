package com.airassist.backend.service;

import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;


/** * Service for handling email sending operations.
 * It prepares the email session, creates the message and sends the email.
 */
@Service
public class MailSenderServiceImpl implements MailSenderService {

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendMessage(String recipient, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    @Override
    public void sendMessageUsingThymesleaf(String recipient, String subject, Map<String, Object> templateModel) throws MessagingException {
        Context thymeleafContext = new Context();
        thymeleafContext.setVariables(templateModel);
        thymeleafContext.setVariable("recipientName", recipient);
        thymeleafContext.setVariable("text", subject);
        thymeleafContext.setVariable("senderName", "AirAssist Team");
        String htmlBody = templateEngine.process("mail.html", thymeleafContext);
        sendMessage(recipient, subject, htmlBody);

    }
}