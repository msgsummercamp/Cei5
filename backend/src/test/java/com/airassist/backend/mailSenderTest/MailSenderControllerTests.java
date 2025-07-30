package com.airassist.backend.mailSenderTest;

import com.airassist.backend.controller.MailSenderController;
import com.airassist.backend.service.MailSenderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MailSenderController.class)
@AutoConfigureMockMvc(addFilters = false)
public class MailSenderControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MailSenderService mailSenderService;

    @Test
    void sendMailWithSuccess() throws Exception {
        doNothing().when(mailSenderService).sendEmail(anyString(), anyString(), anyString());

        String requestBody = """
                {
                    "to": "test@gmail.com",
                    "subject": "Subject",
                    "body": "Body"
                }
                """;

        mockMvc.perform(post("/mail/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string("Email sent successfully"));

    }

    /**
     * This test simulates a failure in sending an email due to an invalid email address.
     * It expects a 400 Bad Request response with an empty body.
     */
    @Test
    void sendMailWithEmailFailure() throws Exception {
        doNothing().when(mailSenderService).sendEmail(anyString(), anyString(), anyString());

        String requestBody = """
                {
                    "to": "invalid-email",
                    "subject": "Subject",
                    "body": "Body"
                }
                """;

        mockMvc.perform(post("/mail/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(""));
    }

}