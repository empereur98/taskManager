import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../data/models/task.dart';
import 'status_chip.dart';

/// Carte représentant une tâche dans la liste (cahier des charges § 9.3).
class TaskTile extends StatelessWidget {
  final Task task;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const TaskTile({
    super.key,
    required this.task,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final createdStr = dateFormat.format(task.createdAt.toLocal());
    final updatedStr = dateFormat.format(task.updatedAt.toLocal());

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ligne supérieure : Titre et badge de statut
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                StatusChip(status: task.status),
              ],
            ),

            // Description (si renseignée, max 2 lignes)
            if (task.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                task.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade700,
                  height: 1.3,
                ),
              ),
            ],

            const SizedBox(height: 12),
            const Divider(height: 1, color: Color(0xFFF3F4F6)),
            const SizedBox(height: 8),

            // Ligne inférieure : dates et boutons d'action
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Créée le $createdStr · Modifiée le $updatedStr',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ),
                // Bouton Modifier
                IconButton(
                  icon: const Icon(Icons.edit_outlined, size: 20),
                  color: const Color(0xFF4B5563),
                  tooltip: 'Modifier la tâche',
                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                  onPressed: onEdit,
                ),
                // Bouton Supprimer
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, size: 20),
                  color: const Color(0xFFDC2626),
                  tooltip: 'Supprimer la tâche',
                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                  onPressed: onDelete,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
