import '../models/task.dart';
import '../models/task_status.dart';

/// Contrat du repository de gestion des tâches (SOLID - Interface Segregation).
abstract interface class TaskRepository {
  /// Récupère toutes les tâches de l'utilisateur connecté (`GET /api/tasks`).
  Future<List<Task>> fetchAll();

  /// Crée une nouvelle tâche (`POST /api/tasks`).
  Future<Task> create({
    required String title,
    required String description,
    required TaskStatus status,
  });

  /// Met à jour une tâche existante (`PUT /api/tasks/{id}`).
  Future<Task> update({
    required int id,
    required String title,
    required String description,
    required TaskStatus status,
  });

  /// Supprime une tâche par son identifiant (`DELETE /api/tasks/{id}`).
  Future<void> delete(int id);
}
