package com.airassist.backend.service;

import com.airassist.backend.service.impl.MailSenderServiceImpl;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MailSenderServiceTest {

    @Mock
    private JavaMailSender mailSender;
    @Mock
    private SpringTemplateEngine templateEngine;
    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private MailSenderServiceImpl mailSenderService;

    @BeforeEach
    void setUp() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void sendMessage_ShouldSendEmail() throws Exception {
        doNothing().when(mailSender).send(mimeMessage);

        mailSenderService.sendMessage("to@example.com", "Subject", "<b>Body</b>");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendMessage_WhenMailSenderThrows_ShouldPropagate() {
        doThrow(new RuntimeException("fail")).when(mailSender).send(mimeMessage);

        assertThrows(RuntimeException.class, () ->
                mailSenderService.sendMessage("to@example.com", "Subject", "<b>Body</b>")
        );
    }

    @Test
    void sendValidCaseEmail_ShouldProcessTemplateAndSend() throws Exception {
        String recipient = "user@example.com";
        int caseId = 42;
        String html = "<b>Valid</b>";

        when(templateEngine.process(eq("validCaseEmail.html"), any(Context.class))).thenReturn(html);
        doNothing().when(mailSender).send(mimeMessage);

        mailSenderService.sendValidCaseEmail(recipient, caseId);

        verify(templateEngine).process(eq("validCaseEmail.html"), any(Context.class));
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendValidCaseEmail_WhenSendThrows_ShouldPropagate() throws Exception {
        String recipient = "user@example.com";
        int caseId = 42;
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("html");
        doThrow(new RuntimeException("fail")).when(mailSender).send(mimeMessage);

        assertThrows(RuntimeException.class, () ->
                mailSenderService.sendValidCaseEmail(recipient, caseId)
        );
    }

    @Test
    void sendGeneratedPasswordEmail_ShouldProcessTemplateAndSend() throws Exception {
        String recipient = "user@example.com";
        String password = "pass";
        String html = "<b>Password</b>";

        when(templateEngine.process(eq("generatedPasswordEmail.html"), any(Context.class))).thenReturn(html);
        doNothing().when(mailSender).send(mimeMessage);

        mailSenderService.sendGeneratedPasswordEmail(recipient, password);

        verify(templateEngine).process(eq("generatedPasswordEmail.html"), any(Context.class));
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendGeneratedPasswordEmail_WhenSendThrows_ShouldPropagate() throws Exception {
        String recipient = "user@example.com";
        String password = "pass";
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("html");
        doThrow(new RuntimeException("fail")).when(mailSender).send(mimeMessage);

        assertThrows(RuntimeException.class, () ->
                mailSenderService.sendGeneratedPasswordEmail(recipient, password)
        );
    }

    @Test
    void sendContractLink_ShouldProcessTemplateAndSend() throws Exception {
        String recipient = "user@example.com";
        String link = "http://contract";
        String html = "<b>Contract</b>";

        when(templateEngine.process(eq("contractLinkEmail.html"), any(Context.class))).thenReturn(html);
        doNothing().when(mailSender).send(mimeMessage);

        mailSenderService.sendContractLink(recipient, link);

        verify(templateEngine).process(eq("contractLinkEmail.html"), any(Context.class));
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendContractLink_WhenSendThrows_ShouldPropagate() throws Exception {
        String recipient = "user@example.com";
        String link = "http://contract";
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("html");
        doThrow(new RuntimeException("fail")).when(mailSender).send(mimeMessage);

        assertThrows(RuntimeException.class, () ->
                mailSenderService.sendContractLink(recipient, link)
        );
    }
}