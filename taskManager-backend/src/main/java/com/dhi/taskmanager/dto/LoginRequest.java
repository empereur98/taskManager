package com.dhi.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Champ requis")
        String email,

        @NotBlank(message = "Champ requis")
        String password
) {
}
