package com.airassist.backend.controller;

import com.airassist.backend.dto.mail.MailRequest;
import com.airassist.backend.service.MailSenderServiceImpl;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


/** * Controller for handling email sending requests.
 * It receives the email details in a request body and uses the MailSenderService to send the email.
 */
@RestController
@RequestMapping("/mail")
public class MailSenderController {

    private final MailSenderServiceImpl mailSenderServiceImpl;

    public MailSenderController(MailSenderServiceImpl mailSenderServiceImpl) {
        this.mailSenderServiceImpl = mailSenderServiceImpl;
    }


    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody @Valid MailRequest mailRequest) throws MessagingException {
            Map<String, Object> model = new HashMap<>();
            model.put("recipientName", "Anna");
            model.put("senderName", "John");
            model.put("text", "Thank you for signing up!");
            mailSenderServiceImpl.sendMessageUsingThymesleaf(mailRequest.getRecipient(), mailRequest.getSubject(), model);
            return ResponseEntity.ok("Email sent successfully");
    }
}