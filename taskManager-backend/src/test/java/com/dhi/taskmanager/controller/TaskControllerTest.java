package com.dhi.taskmanager.controller;

import com.dhi.taskmanager.dto.TaskRequest;
import com.dhi.taskmanager.dto.TaskResponse;
import com.dhi.taskmanager.entity.TaskStatus;
import com.dhi.taskmanager.security.CustomUserDetailsService;
import com.dhi.taskmanager.security.JwtService;
import com.dhi.taskmanager.service.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    private TaskResponse taskResponse;

    @BeforeEach
    void setUp() {
        taskResponse = new TaskResponse(
                1L,
                "Test Task",
                "Description",
                TaskStatus.TODO,
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    void findAll_shouldReturnTasks() throws Exception {
        when(taskService.findAll("test@example.com")).thenReturn(List.of(taskResponse));

        mockMvc.perform(get("/api/tasks").principal(() -> "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Task"));
    }

    @Test
    void create_shouldReturnCreated_whenValidRequest() throws Exception {
        TaskRequest request = new TaskRequest("Test Task", "Description", TaskStatus.TODO);
        when(taskService.create(any(TaskRequest.class), eq("test@example.com"))).thenReturn(taskResponse);

        mockMvc.perform(post("/api/tasks")
                        .principal(() -> "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void create_shouldReturnBadRequest_whenTitleBlank() throws Exception {
        TaskRequest request = new TaskRequest("", "Description", TaskStatus.TODO);

        mockMvc.perform(post("/api/tasks")
                        .principal(() -> "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_shouldReturnOk_whenValidRequest() throws Exception {
        TaskRequest request = new TaskRequest("Updated Task", "New Description", TaskStatus.IN_PROGRESS);
        TaskResponse updatedResponse = new TaskResponse(
                1L,
                "Updated Task",
                "New Description",
                TaskStatus.IN_PROGRESS,
                Instant.now(),
                Instant.now()
        );

        when(taskService.update(eq(1L), any(TaskRequest.class), eq("test@example.com"))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/tasks/1")
                        .principal(() -> "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void delete_shouldReturnNoContent_whenTaskExists() throws Exception {
        mockMvc.perform(delete("/api/tasks/1").principal(() -> "test@example.com"))
                .andExpect(status().isNoContent());

        verify(taskService).delete(1L, "test@example.com");
    }
}

