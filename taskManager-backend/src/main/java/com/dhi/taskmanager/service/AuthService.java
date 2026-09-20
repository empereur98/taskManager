package com.dhi.taskmanager.service;

import com.dhi.taskmanager.dto.AuthResponse;
import com.dhi.taskmanager.dto.LoginRequest;
import com.dhi.taskmanager.dto.RegisterRequest;
import com.dhi.taskmanager.dto.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
