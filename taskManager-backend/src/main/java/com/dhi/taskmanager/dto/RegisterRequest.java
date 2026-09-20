package com.dhi.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email invalide")
        @Email(message = "Email invalide")
        @Size(max = 255, message = "Email invalide")
        String email,

        @NotBlank(message = "Le mot de passe doit contenir entre 8 et 72 caractères")
        @Size(min = 8, max = 72, message = "Le mot de passe doit contenir entre 8 et 72 caractères")
        String password,

        @Size(max = 255, message = "Le nom ne doit pas dépasser 255 caractères")
        String name
) {
    public RegisterRequest(String email, String password) {
        this(email, password, null);
    }
}
