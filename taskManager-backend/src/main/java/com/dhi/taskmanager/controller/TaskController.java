package com.dhi.taskmanager.controller;

import com.dhi.taskmanager.dto.TaskRequest;
import com.dhi.taskmanager.dto.TaskResponse;
import com.dhi.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger log = LoggerFactory.getLogger(TaskController.class);
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> findAll(Principal principal) {
        log.info("[TASKS] Récupération des tâches pour l'utilisateur : {}", principal.getName());
        List<TaskResponse> tasks = taskService.findAll(principal.getName());
        log.info("[TASKS] {} tâche(s) trouvée(s) pour : {}", tasks.size(), principal.getName());
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request,
                                               Principal principal) {
        log.info("[TASKS] Création d'une tâche '{}' par : {}", request.title(), principal.getName());
        TaskResponse task = taskService.create(request, principal.getName());
        log.info("[TASKS] Tâche créée avec succès (ID: {}) pour : {}", task.id(), principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody TaskRequest request,
                                               Principal principal) {
        log.info("[TASKS] Modification de la tâche ID {} par : {}", id, principal.getName());
        TaskResponse task = taskService.update(id, request, principal.getName());
        log.info("[TASKS] Tâche ID {} modifiée avec succès", id);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       Principal principal) {
        log.info("[TASKS] Suppression de la tâche ID {} par : {}", id, principal.getName());
        taskService.delete(id, principal.getName());
        log.info("[TASKS] Tâche ID {} supprimée avec succès", id);
        return ResponseEntity.noContent().build();
    }
}


