import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Statuts d'une tâche alignés avec l'API backend et le frontend web (cahier des charges § 7.2).
enum TaskStatus {
  todo('TODO', 'À faire', AppTheme.statusTodo),
  inProgress('IN_PROGRESS', 'En cours', AppTheme.statusInProgress),
  done('DONE', 'Terminée', AppTheme.statusDone);

  final String apiValue;
  final String label;
  final Color color;

  const TaskStatus(this.apiValue, this.label, this.color);

  /// Convertit une chaîne issue de l'API vers un [TaskStatus].
  ///
  /// Lève une [FormatException] si la valeur est inconnue (aucun fallback silencieux selon § 7.2).
  static TaskStatus fromApiValue(String value) {
    for (final status in TaskStatus.values) {
      if (status.apiValue == value) {
        return status;
      }
    }
    throw FormatException('Statut de tâche inconnu reçu de l\'API : "$value"');
  }
}
