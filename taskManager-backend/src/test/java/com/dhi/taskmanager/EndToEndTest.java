package com.dhi.taskmanager;

import com.dhi.taskmanager.dto.LoginRequest;
import com.dhi.taskmanager.dto.RegisterRequest;
import com.dhi.taskmanager.dto.TaskRequest;
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
class EndToEndTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String token;

    @Test
    void fullWorkflow_shouldCompleteSuccessfully() throws Exception {
        // Step 1: Register a user
        RegisterRequest registerRequest = new RegisterRequest("e2e@example.com", "password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("e2e@example.com"));

        // Step 2: Login and get token
        LoginRequest loginRequest = new LoginRequest("e2e@example.com", "password123");
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();

        token = objectMapper.readTree(response).get("token").asText();

        // Step 3: Get empty task list
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Step 4: Create a task
        TaskRequest taskRequest = new TaskRequest("E2E Task", "Description", com.dhi.taskmanager.entity.TaskStatus.TODO);
        String taskResponse = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("E2E Task"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andReturn().getResponse().getContentAsString();

        long taskId = objectMapper.readTree(taskResponse).get("id").asLong();

        // Step 5: Get tasks (should have one)
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        // Step 6: Update the task
        TaskRequest updateRequest = new TaskRequest("Updated E2E Task", "Updated Description", com.dhi.taskmanager.entity.TaskStatus.IN_PROGRESS);
        mockMvc.perform(put("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated E2E Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // Step 7: Delete the task
        mockMvc.perform(delete("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        // Step 8: Verify task list is empty again
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void userIsolation_shouldPreventAccessToOtherUsersTasks() throws Exception {
        // Register and login user1
        RegisterRequest user1Register = new RegisterRequest("user1@example.com", "password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user1Register)));

        LoginRequest user1Login = new LoginRequest("user1@example.com", "password123");
        String user1Response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user1Login)))
                .andReturn().getResponse().getContentAsString();
        String user1Token = objectMapper.readTree(user1Response).get("token").asText();

        // Create task for user1
        TaskRequest taskRequest = new TaskRequest("User1 Task", "Description", com.dhi.taskmanager.entity.TaskStatus.TODO);
        String user1TaskResponse = mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskRequest)))
                .andReturn().getResponse().getContentAsString();
        long user1TaskId = objectMapper.readTree(user1TaskResponse).get("id").asLong();

        // Register and login user2
        RegisterRequest user2Register = new RegisterRequest("user2@example.com", "password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user2Register)));

        LoginRequest user2Login = new LoginRequest("user2@example.com", "password123");
        String user2Response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user2Login)))
                .andReturn().getResponse().getContentAsString();
        String user2Token = objectMapper.readTree(user2Response).get("token").asText();

        // User2 should not see user1's task
        mockMvc.perform(get("/api/tasks")
                .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // User2 should not be able to update user1's task (returns 404 per RB-08)
        TaskRequest updateRequest = new TaskRequest("Updated Task", "Description", com.dhi.taskmanager.entity.TaskStatus.DONE);
        mockMvc.perform(put("/api/tasks/" + user1TaskId)
                .header("Authorization", "Bearer " + user2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());

        // User2 should not be able to delete user1's task (returns 404 per RB-09)
        mockMvc.perform(delete("/api/tasks/" + user1TaskId)
                .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isNotFound());
    }
}
