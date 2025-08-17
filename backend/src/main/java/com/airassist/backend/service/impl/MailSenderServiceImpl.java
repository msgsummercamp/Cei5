package com.airassist.backend.service.impl;

import com.airassist.backend.service.MailSenderService;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;


@Service
public class MailSenderServiceImpl implements MailSenderService {

    private final String recipientName = "recipientName";
    private String mailSubject;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends an email message with the specified recipient, subject, and HTML body.
     * @param recipient Recipient's email address.
     * @param subject Subject of the email.
     * @param htmlBody the HTML page containing the email body.
     * @throws MessagingException if there is an error in sending the email.
     */
    @Override
    public void sendMessage(String recipient, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    /**
     * Sends an email to notify the recipient about a new case.
     * @param recipient Recipient's email address.
     * @param caseId ID of the case.
     * @throws MessagingException if there is an error in sending the email.
     */
    @Override
    public void sendValidCaseEmail(String recipient, int caseId) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable(recipientName, recipient);
        thymeleafContext.setVariable("caseId", caseId);
        String htmlBody = templateEngine.process("validCaseEmail.html", thymeleafContext);
        mailSubject = "Case Validated Successfully";

        sendMessage(recipient, mailSubject, htmlBody);
    }

    /**
     * Sends an email to notify the recipient about the generation of a new password.
     * @param recipient Recipient's email address.
     * @param generatedPassword The generated password to be sent.
     * @throws MessagingException if there is an error in sending the email.
     */
    @Override
    public void sendGeneratedPasswordEmail(String recipient, String generatedPassword) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable(recipientName, recipient);
        thymeleafContext.setVariable("generatedPassword", generatedPassword);
        String htmlBody = templateEngine.process("generatedPasswordEmail.html", thymeleafContext);
        mailSubject = "Your Generated Password";

        sendMessage(recipient, mailSubject, htmlBody);
    }

    /**
     * Sends an email to notify the recipient about a contract link.
     * @param recipient Recipient's email address.
     * @param contractLink The link to the contract to be sent.
     * @throws MessagingException if there is an error in sending the email.
     */
    @Override
    public void sendContractLink(String recipient, String contractLink) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable(recipientName, recipient);
        thymeleafContext.setVariable("contractLink", contractLink);
        String htmlBody = templateEngine.process("contractLinkEmail.html", thymeleafContext);
        mailSubject = "Contract Link";

        sendMessage(recipient, mailSubject, htmlBody);
    }
}