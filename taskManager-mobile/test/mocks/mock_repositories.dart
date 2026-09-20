import 'package:task_manager_mobile/core/errors/app_exception.dart';
import 'package:task_manager_mobile/core/storage/token_storage.dart';
import 'package:task_manager_mobile/data/models/task.dart';
import 'package:task_manager_mobile/data/models/task_status.dart';
import 'package:task_manager_mobile/data/repositories/auth_repository.dart';
import 'package:task_manager_mobile/data/repositories/task_repository.dart';

/// Implémentation en mémoire de [TokenStorage] pour les tests sans périphérique physique.
class MockTokenStorage implements TokenStorage {
  String? _token;

  MockTokenStorage([this._token]);

  @override
  Future<String?> read() async => _token;

  @override
  Future<void> write(String token) async {
    _token = token;
  }

  @override
  Future<void> clear() async {
    _token = null;
  }
}

/// Implémentation en mémoire de [AuthRepository] pour les tests (sans appel réseau réel).
class MockAuthRepository implements AuthRepository {
  bool shouldFail = false;
  String expectedToken = 'fake_jwt_token_12345';

  @override
  Future<String> login({required String email, required String password}) async {
    if (shouldFail) {
      throw const AppException('Email ou mot de passe incorrect.', 401);
    }
    return expectedToken;
  }
}

/// Implémentation en mémoire de [TaskRepository] pour les tests.
class MockTaskRepository implements TaskRepository {
  final List<Task> _tasks = <Task>[];
  bool shouldFail = false;
  int _nextId = 1;

  void seedTasks(List<Task> initial) {
    _tasks.clear();
    _tasks.addAll(initial);
    if (initial.isNotEmpty) {
      _nextId = initial.map((t) => t.id).reduce((a, b) => a > b ? a : b) + 1;
    }
  }

  @override
  Future<List<Task>> fetchAll() async {
    if (shouldFail) {
      throw const AppException('Impossible de contacter le serveur. Vérifiez votre connexion.');
    }
    return List<Task>.from(_tasks);
  }

  @override
  Future<Task> create({
    required String title,
    required String description,
    required TaskStatus status,
  }) async {
    if (shouldFail) {
      throw const AppException('Erreur de création de tâche.');
    }
    final now = DateTime.now().toUtc();
    final newTask = Task(
      id: _nextId++,
      title: title,
      description: description,
      status: status,
      createdAt: now,
      updatedAt: now,
    );
    _tasks.add(newTask);
    return newTask;
  }

  @override
  Future<Task> update({
    required int id,
    required String title,
    required String description,
    required TaskStatus status,
  }) async {
    if (shouldFail) {
      throw const AppException('Erreur de modification.');
    }
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) {
      throw const AppException('Tâche introuvable.', 404);
    }
    final updated = _tasks[index].copyWith(
      title: title,
      description: description,
      status: status,
      updatedAt: DateTime.now().toUtc(),
    );
    _tasks[index] = updated;
    return updated;
  }

  @override
  Future<void> delete(int id) async {
    if (shouldFail) {
      throw const AppException('Erreur de suppression.');
    }
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index == -1) {
      throw const AppException('Tâche introuvable.', 404);
    }
    _tasks.removeAt(index);
  }
}
