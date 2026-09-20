package com.dhi.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthResponse(String token, UserResponse user) {
    public AuthResponse(String token) {
        this(token, null);
    }
}
