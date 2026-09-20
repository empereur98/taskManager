import 'task_status.dart';

/// Modèle représentant une tâche dans l'application mobile (cahier des charges § 7.1).
class Task {
  final int id;
  final String title;
  final String description;
  final TaskStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Task({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Désérialisation manuelle depuis le JSON retourné par l'API Spring Boot.
  ///
  /// Gère la conversion de `description: null` en chaîne vide `""` (§ 7.1).
  factory Task.fromJson(Map<String, dynamic> json) {
    final rawDescription = json['description'];
    final description = (rawDescription == null) ? '' : rawDescription.toString();

    final rawCreatedAt = json['createdAt'];
    final rawUpdatedAt = json['updatedAt'];

    final createdAt = rawCreatedAt is String
        ? DateTime.parse(rawCreatedAt)
        : DateTime.now();

    final updatedAt = rawUpdatedAt is String
        ? DateTime.parse(rawUpdatedAt)
        : createdAt;

    return Task(
      id: json['id'] as int,
      title: json['title'] as String,
      description: description,
      status: TaskStatus.fromApiValue(json['status'] as String),
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Sérialisation manuelle pour les requêtes POST/PUT de l'API.
  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'title': title,
      'description': description.isEmpty ? null : description,
      'status': status.apiValue,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Task copyWith({
    int? id,
    String? title,
    String? description,
    TaskStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Task &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          title == other.title &&
          description == other.description &&
          status == other.status &&
          createdAt == other.createdAt &&
          updatedAt == other.updatedAt;

  @override
  int get hashCode => Object.hash(id, title, description, status, createdAt, updatedAt);

  @override
  String toString() => 'Task(id: $id, title: $title, status: ${status.apiValue})';
}
