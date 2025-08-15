package com.airassist.backend.service;

import com.airassist.backend.exception.user.PasswordApiException;
import com.airassist.backend.service.impl.RandomPasswordGeneratorServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RandomPasswordGeneratorServiceTest {

    @InjectMocks
    private RandomPasswordGeneratorServiceImpl service;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(service, "apiUrl", "http://mock.api/{}");
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "objectMapper", objectMapper);
    }

    @Test
    void generateRandomPassword_WhenApiReturnsPassword_ShouldReturnPassword() throws Exception {
        String response = "{\"password\":\"abc123\"}";
        JsonNode node = mock(JsonNode.class);

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(response);
        when(objectMapper.readTree(response)).thenReturn(node);
        when(node.has("password")).thenReturn(true);
        when(node.get("password")).thenReturn(node);
        when(node.isNull()).thenReturn(false);
        when(node.asText()).thenReturn("abc123");

        String result = service.generateRandomPassword(6);

        assertEquals("abc123", result);
    }

    @Test
    void generateRandomPassword_WhenApiThrows_ShouldThrowPasswordApiException() {
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenThrow(new RuntimeException("fail"));

        assertThrows(PasswordApiException.class, () -> service.generateRandomPassword(8));
    }

    @Test
    void generateRandomPassword_WhenJsonMissingPassword_ShouldThrowPasswordApiException() throws Exception {
        String response = "{\"notPassword\":\"x\"}";
        JsonNode node = mock(JsonNode.class);

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(response);
        when(objectMapper.readTree(response)).thenReturn(node);
        when(node.has("password")).thenReturn(false);

        assertThrows(PasswordApiException.class, () -> service.generateRandomPassword(8));
    }

    @Test
    void generateRandomPassword_WhenPasswordIsNull_ShouldThrowPasswordApiException() throws Exception {
        String response = "{\"password\":null}";
        JsonNode node = mock(JsonNode.class);

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(response);
        when(objectMapper.readTree(response)).thenReturn(node);
        when(node.has("password")).thenReturn(true);
        when(node.get("password")).thenReturn(node);
        when(node.isNull()).thenReturn(true);

        assertThrows(PasswordApiException.class, () -> service.generateRandomPassword(8));
    }

    @Test
    void generateRandomPassword_WhenJsonProcessingException_ShouldThrow() throws Exception {
        String response = "bad json";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(response);
        when(objectMapper.readTree(response)).thenThrow(new JsonProcessingException("fail") {});

        assertThrows(JsonProcessingException.class, () -> service.generateRandomPassword(8));
    }

    @Test
    void generateRandomPassword_NoArg_ShouldCallWithDefaultLength() throws Exception {
        RandomPasswordGeneratorServiceImpl spyService = Mockito.spy(service);
        doReturn("mocked").when(spyService).generateRandomPassword(12);

        String result = spyService.generateRandomPassword();

        assertEquals("mocked", result);
    }
}