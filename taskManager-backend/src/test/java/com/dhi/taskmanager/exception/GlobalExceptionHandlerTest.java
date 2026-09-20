package com.dhi.taskmanager.exception;

import com.dhi.taskmanager.dto.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/tasks");
    }

    @Test
    void handleResourceNotFoundException_shouldReturn404AndPopulatePath() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Tâche introuvable");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().status());
        assertEquals("Not Found", response.getBody().error());
        assertEquals("Tâche introuvable", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
        assertNotNull(response.getBody().timestamp());
        assertNull(response.getBody().fieldErrors());
    }

    @Test
    void handleEmailAlreadyUsedException_shouldReturn409AndPopulatePath() {
        EmailAlreadyUsedException ex = new EmailAlreadyUsedException("Cet email est déjà utilisé");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleEmailAlreadyUsedException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().status());
        assertEquals("Conflict", response.getBody().error());
        assertEquals("Cet email est déjà utilisé", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
    }

    @Test
    void handleDataIntegrityViolationException_shouldReturn409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Duplicate key");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolationException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().status());
        assertEquals("Cet email est déjà utilisé", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
    }

    @Test
    void handleBadCredentialsException_shouldReturn401() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleBadCredentialsException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().status());
        assertEquals("Unauthorized", response.getBody().error());
        assertEquals("Email ou mot de passe incorrect", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
    }

    @Test
    void handleHttpMessageNotReadableException_shouldReturn400() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Malformed JSON", (org.springframework.http.HttpInputMessage) null);

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleHttpMessageNotReadableException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().status());
        assertEquals("Requête invalide", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
    }

    @Test
    void handleMethodArgumentTypeMismatchException_shouldReturn400() {
        MethodArgumentTypeMismatchException ex = org.mockito.Mockito.mock(MethodArgumentTypeMismatchException.class);

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleMethodArgumentTypeMismatchException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().status());
        assertEquals("Paramètre invalide", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
    }

    @Test
    void handleGenericException_shouldReturn500WithoutLeakingDetails() {
        Exception ex = new RuntimeException("Database connection failed details sensitive information");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().status());
        assertEquals("Internal Server Error", response.getBody().error());
        assertEquals("Erreur interne du serveur", response.getBody().message());
        assertEquals("/api/tasks", response.getBody().path());
        assertFalse(response.getBody().message().contains("Database connection failed"));
    }
}
