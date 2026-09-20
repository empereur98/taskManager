package com.dhi.taskmanager.security;

import com.dhi.taskmanager.dto.LoginRequest;
import com.dhi.taskmanager.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void register_shouldNotRequireAuthentication() throws Exception {
        RegisterRequest request = new RegisterRequest("security-register@example.com", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void login_shouldNotRequireAuthentication() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("security-login@example.com", "password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        LoginRequest loginRequest = new LoginRequest("security-login@example.com", "password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void getTasks_shouldReturnUnauthorized_withoutToken() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createTask_shouldReturnUnauthorized_withoutToken() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test\",\"status\":\"TODO\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateTask_shouldReturnUnauthorized_withoutToken() throws Exception {
        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test\",\"status\":\"TODO\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteTask_shouldReturnUnauthorized_withoutToken() throws Exception {
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cors_shouldAllowConfiguredOrigins() throws Exception {
        mockMvc.perform(options("/api/tasks")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));

        mockMvc.perform(options("/api/tasks")
                        .header("Origin", "http://localhost:5174")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5174"));

        mockMvc.perform(options("/api/tasks")
                        .header("Origin", "http://localhost:49286")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:49286"));
    }

    @Test
    void cors_shouldRejectUnauthorizedOrigin() throws Exception {
        mockMvc.perform(options("/api/tasks")
                        .header("Origin", "http://evil-site.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}

