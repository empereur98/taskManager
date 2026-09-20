package com.dhi.taskmanager.dto;

import com.dhi.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank(message = "Le titre est requis")
        @Size(max = 255, message = "Le titre est requis")
        String title,

        @Size(max = 1000, message = "La description est trop longue")
        String description,

        @NotNull(message = "Le statut est requis")
        TaskStatus status
) {
}
