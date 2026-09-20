package com.dhi.taskmanager.service.impl;

import com.dhi.taskmanager.dto.AuthResponse;
import com.dhi.taskmanager.dto.LoginRequest;
import com.dhi.taskmanager.dto.RegisterRequest;
import com.dhi.taskmanager.dto.UserResponse;
import com.dhi.taskmanager.entity.User;
import com.dhi.taskmanager.exception.EmailAlreadyUsedException;
import com.dhi.taskmanager.mapper.UserMapper;
import com.dhi.taskmanager.repository.UserRepository;
import com.dhi.taskmanager.security.JwtService;
import com.dhi.taskmanager.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé");
        }

        String name = request.name() != null ? request.name().trim() : null;
        User user = new User(normalizedEmail, passwordEncoder.encode(request.password()), name);
        User savedUser = userRepository.save(user);

        return UserMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        String email = authentication.getName();
        String token = jwtService.generateToken(email);

        User user = userRepository.findByEmail(email).orElse(null);
        UserResponse userResponse = user != null ? UserMapper.toResponse(user) : null;

        return new AuthResponse(token, userResponse);
    }
}
