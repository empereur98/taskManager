package com.dhi.taskmanager.service;

import com.dhi.taskmanager.dto.TaskRequest;
import com.dhi.taskmanager.dto.TaskResponse;

import java.util.List;

public interface TaskService {
    List<TaskResponse> findAll(String userEmail);
    TaskResponse create(TaskRequest request, String userEmail);
    TaskResponse update(Long id, TaskRequest request, String userEmail);
    void delete(Long id, String userEmail);
}

