package com.airassist.backend.controller;

import com.airassist.backend.dto.mail.MailRequest;
import com.airassist.backend.service.MailSenderService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


/** * Controller for handling email sending requests.
 * It receives the email details in a request body and uses the MailSenderService to send the email.
 */
@RestController
@RequestMapping("/mail")
public class MailSenderController {

    private final MailSenderService mailSenderService;

    public MailSenderController(MailSenderService mailSenderService) {
        this.mailSenderService = mailSenderService;
    }


    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody @Valid MailRequest mailRequest) throws MessagingException {
            mailSenderService.sendEmail(mailRequest.getTo(), mailRequest.getSubject(), mailRequest.getBody());
            return ResponseEntity.ok("Email sent successfully");
    }
}