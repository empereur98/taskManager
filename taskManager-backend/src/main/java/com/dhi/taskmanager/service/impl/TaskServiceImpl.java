package com.dhi.taskmanager.service.impl;

import com.dhi.taskmanager.dto.TaskRequest;
import com.dhi.taskmanager.dto.TaskResponse;
import com.dhi.taskmanager.entity.Task;
import com.dhi.taskmanager.entity.User;
import com.dhi.taskmanager.exception.ResourceNotFoundException;
import com.dhi.taskmanager.mapper.TaskMapper;
import com.dhi.taskmanager.repository.TaskRepository;
import com.dhi.taskmanager.repository.UserRepository;
import com.dhi.taskmanager.service.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findAll(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Task> tasks = taskRepository.findAllByUserOrderByCreatedAtDesc(user);
        return tasks.stream()
                .map(TaskMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TaskResponse create(TaskRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Task task = TaskMapper.toEntity(request, user);
        Task savedTask = taskRepository.save(task);
        return TaskMapper.toResponse(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse update(Long id, TaskRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());

        Task updatedTask = taskRepository.save(task);
        return TaskMapper.toResponse(updatedTask);
    }

    @Override
    @Transactional
    public void delete(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        taskRepository.delete(task);
    }
}

