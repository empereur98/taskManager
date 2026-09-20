package com.dhi.taskmanager.service;

import com.dhi.taskmanager.dto.TaskRequest;
import com.dhi.taskmanager.dto.TaskResponse;
import com.dhi.taskmanager.entity.Task;
import com.dhi.taskmanager.entity.TaskStatus;
import com.dhi.taskmanager.entity.User;
import com.dhi.taskmanager.exception.ResourceNotFoundException;
import com.dhi.taskmanager.repository.TaskRepository;
import com.dhi.taskmanager.repository.UserRepository;
import com.dhi.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User user;
    private Task task;
    private TaskRequest taskRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        task = new Task();
        task.setId(1L);
        task.setTitle("Test Task");
        task.setDescription("Description");
        task.setStatus(TaskStatus.TODO);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
        task.setUser(user);

        taskRequest = new TaskRequest("Test Task", "Description", TaskStatus.TODO);
    }

    @Test
    void findAll_shouldReturnTasksForUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.findAllByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(task));

        List<TaskResponse> result = taskService.findAll("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Task", result.get(0).title());
        verify(userRepository).findByEmail("test@example.com");
        verify(taskRepository).findAllByUserOrderByCreatedAtDesc(user);
    }

    @Test
    void findAll_shouldThrowException_whenUserNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.findAll("test@example.com"));
        verify(taskRepository, never()).findAllByUserOrderByCreatedAtDesc(any());
    }

    @Test
    void create_shouldSaveAndReturnTask() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskResponse result = taskService.create(taskRequest, "test@example.com");

        assertNotNull(result);
        assertEquals("Test Task", result.title());
        verify(userRepository).findByEmail("test@example.com");
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void update_shouldUpdateAndReturnTask_whenTaskExistsAndBelongsToUser() {
        TaskRequest updateRequest = new TaskRequest("Updated Task", "New Description", TaskStatus.IN_PROGRESS);
        Task updatedTask = new Task();
        updatedTask.setId(1L);
        updatedTask.setTitle("Updated Task");
        updatedTask.setDescription("New Description");
        updatedTask.setStatus(TaskStatus.IN_PROGRESS);
        updatedTask.setCreatedAt(Instant.now());
        updatedTask.setUpdatedAt(Instant.now());
        updatedTask.setUser(user);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser(1L, user)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        TaskResponse result = taskService.update(1L, updateRequest, "test@example.com");

        assertNotNull(result);
        assertEquals("Updated Task", result.title());
        assertEquals(TaskStatus.IN_PROGRESS, result.status());
        verify(userRepository).findByEmail("test@example.com");
        verify(taskRepository).findByIdAndUser(1L, user);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void update_shouldThrowException_whenTaskNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser(1L, user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.update(1L, taskRequest, "test@example.com"));
        verify(taskRepository).findByIdAndUser(1L, user);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void delete_shouldDeleteTask_whenTaskExistsAndBelongsToUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser(1L, user)).thenReturn(Optional.of(task));

        taskService.delete(1L, "test@example.com");

        verify(userRepository).findByEmail("test@example.com");
        verify(taskRepository).findByIdAndUser(1L, user);
        verify(taskRepository).delete(task);
    }

    @Test
    void delete_shouldThrowException_whenTaskNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser(1L, user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.delete(1L, "test@example.com"));
        verify(userRepository).findByEmail("test@example.com");
        verify(taskRepository).findByIdAndUser(1L, user);
        verify(taskRepository, never()).delete(any());
    }
}

