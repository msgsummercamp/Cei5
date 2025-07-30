package com.airassist.backend.dto.mail;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MailRequest {

    @Size(max = 254, message = "Email must be less than 254 characters")
    @Email(message = "Email must be valid")
    private String to;

    @Size(max = 100, message = "Subject must be less than 255 characters")
    private String subject;

    @Size(max  = 400, message = "Body must be less than 1000 characters")
    private String body;


}
