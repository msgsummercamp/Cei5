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

    private String mailSubject;

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
    public void sendValidCaseEmail(String recipient, int caseId) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable("recipientName", recipient);
        thymeleafContext.setVariable("caseId", caseId);
        String htmlBody = templateEngine.process("validCaseEmail.html", thymeleafContext);
        mailSubject = "Case Validated Successfully";

        sendMessage(recipient, mailSubject, htmlBody);
    }

    @Override
    public void sendGeneratedPasswordEmail(String recipient, String generatedPassword) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable("recipientName", recipient);
        thymeleafContext.setVariable("generatedPassword", generatedPassword);
        String htmlBody = templateEngine.process("generatedPasswordEmail.html", thymeleafContext);
        mailSubject = "Your Generated Password";

        sendMessage(recipient, mailSubject, htmlBody);
    }

    @Override
    public void sendContractLink(String recipient, String contractLink) throws MessagingException {
        Context thymeleafContext = new Context();

        thymeleafContext.setVariable("recipientName", recipient);
        thymeleafContext.setVariable("contractLink", contractLink);
        String htmlBody = templateEngine.process("contractLinkEmail.html", thymeleafContext);
        mailSubject = "Contract Link";

        sendMessage(recipient, mailSubject, htmlBody);
    }
}