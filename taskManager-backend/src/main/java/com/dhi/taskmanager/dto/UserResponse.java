package com.dhi.taskmanager.dto;

public record UserResponse(Long id, String email, String name) {
    public UserResponse(Long id, String email) {
        this(id, email, null);
    }
}
