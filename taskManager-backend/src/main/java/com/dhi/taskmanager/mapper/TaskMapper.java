package com.dhi.taskmanager.mapper;

import com.dhi.taskmanager.dto.TaskRequest;
import com.dhi.taskmanager.dto.TaskResponse;
import com.dhi.taskmanager.entity.Task;
import com.dhi.taskmanager.entity.User;

public class TaskMapper {

    public static Task toEntity(TaskRequest request, User user) {
        return new Task(request.title(), request.description(), request.status(), user);
    }

    public static TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
