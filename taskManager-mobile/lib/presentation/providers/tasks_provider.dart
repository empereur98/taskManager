import 'package:flutter/foundation.dart';

import '../../data/models/task.dart';
import '../../data/models/task_status.dart';
import '../../data/repositories/task_repository.dart';

/// Provider gérant la liste des tâches et les opérations CRUD (cahier des charges § 4 & § 8).
///
/// Ne dépend que de l'abstraction [TaskRepository] (SOLID - Inversion des dépendances).
class TasksProvider extends ChangeNotifier {
  final TaskRepository _taskRepository;

  List<Task> _tasks = <Task>[];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  TasksProvider({required TaskRepository taskRepository})
      : _taskRepository = taskRepository;

  List<Task> get tasks => List.unmodifiable(_tasks);
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  /// Charge toutes les tâches depuis l'API.
  Future<void> loadTasks() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final fetchedTasks = await _taskRepository.fetchAll();
      // Tri du plus récent au plus ancien par défaut
      fetchedTasks.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      _tasks = fetchedTasks;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Crée une nouvelle tâche et l'insère en tête de liste sans rechargement complet (§ RM-17).
  Future<bool> createTask({
    required String title,
    required String description,
    required TaskStatus status,
  }) async {
    if (_isSubmitting) return false;
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final created = await _taskRepository.create(
        title: title,
        description: description,
        status: status,
      );
      _tasks = <Task>[created, ..._tasks];
      _isSubmitting = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  /// Met à jour une tâche existante localement et sur le serveur sans rechargement complet (§ RM-17).
  Future<bool> updateTask({
    required int id,
    required String title,
    required String description,
    required TaskStatus status,
  }) async {
    if (_isSubmitting) return false;
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updated = await _taskRepository.update(
        id: id,
        title: title,
        description: description,
        status: status,
      );

      final index = _tasks.indexWhere((t) => t.id == id);
      if (index != -1) {
        final updatedList = List<Task>.from(_tasks);
        updatedList[index] = updated;
        _tasks = updatedList;
      }
      _isSubmitting = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  /// Supprime une tâche de la liste locale et sur le serveur sans rechargement complet (§ RM-17).
  Future<bool> deleteTask(int id) async {
    _errorMessage = null;
    notifyListeners();

    try {
      await _taskRepository.delete(id);
      _tasks = _tasks.where((t) => t.id != id).toList();
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Réinitialise la liste en mémoire (ex: lors de la déconnexion).
  void clear() {
    _tasks = <Task>[];
    _errorMessage = null;
    _isLoading = false;
    _isSubmitting = false;
    notifyListeners();
  }
}
