package com.dhi.taskmanager.controller;

import com.dhi.taskmanager.dto.AuthResponse;
import com.dhi.taskmanager.dto.LoginRequest;
import com.dhi.taskmanager.dto.RegisterRequest;
import com.dhi.taskmanager.dto.UserResponse;
import com.dhi.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("[AUTH] Requête d'inscription reçue pour : {}", request.email());
        UserResponse response = authService.register(request);
        log.info("[AUTH] Inscription réussie pour : {} (ID: {})", response.email(), response.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("[AUTH] Requête de connexion reçue pour : {}", request.email());
        AuthResponse response = authService.login(request);
        log.info("[AUTH] Connexion réussie pour : {}", request.email());
        return ResponseEntity.ok(response);
    }
}

