import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../data/models/task.dart';
import '../../data/models/task_status.dart';
import '../providers/tasks_provider.dart';

/// Écran unifié de création et modification d'une tâche (cahier des charges § 9.4).
class TaskFormScreen extends StatefulWidget {
  final Task? taskToEdit;

  const TaskFormScreen({super.key, this.taskToEdit});

  bool get isEditing => taskToEdit != null;

  @override
  State<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends State<TaskFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late TaskStatus _selectedStatus;

  @override
  void initState() {
    super.initState();
    final task = widget.taskToEdit;
    _titleController = TextEditingController(text: task?.title ?? '');
    _descriptionController = TextEditingController(text: task?.description ?? '');
    _selectedStatus = task?.status ?? TaskStatus.todo;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _saveTask() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final tasksProvider = context.read<TasksProvider>();
    final title = _titleController.text.trim();
    final description = _descriptionController.text.trim();
    final messenger = ScaffoldMessenger.of(context);

    bool success;
    if (widget.isEditing) {
      success = await tasksProvider.updateTask(
        id: widget.taskToEdit!.id,
        title: title,
        description: description,
        status: _selectedStatus,
      );
    } else {
      success = await tasksProvider.createTask(
        title: title,
        description: description,
        status: _selectedStatus,
      );
    }

    if (!mounted) return;

    messenger.hideCurrentSnackBar();

    if (success) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            widget.isEditing
                ? 'Tâche modifiée avec succès.'
                : 'Tâche créée avec succès.',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.of(context).pop();
    } else {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            tasksProvider.errorMessage ??
                'Une erreur est survenue lors de l\'enregistrement.',
          ),
          backgroundColor: Theme.of(context).colorScheme.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = context.watch<TasksProvider>().isSubmitting;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Modifier la tâche' : 'Ajouter une tâche'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Champ Titre (requis, max 255)
                TextFormField(
                  controller: _titleController,
                  enabled: !isSubmitting,
                  textInputAction: TextInputAction.next,
                  maxLength: 255,
                  decoration: const InputDecoration(
                    labelText: 'Titre de la tâche *',
                    hintText: 'Ex: Rédiger le rapport mensuel',
                    prefixIcon: Icon(Icons.title_rounded),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Le titre est requis.';
                    }
                    if (value.trim().length > 255) {
                      return 'Le titre ne peut dépasser 255 caractères.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Champ Description (optionnel, max 1000, 4 lignes)
                TextFormField(
                  controller: _descriptionController,
                  enabled: !isSubmitting,
                  maxLines: 4,
                  maxLength: 1000,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Détails ou notes complémentaires (optionnel)...',
                    alignLabelWithHint: true,
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 56),
                      child: Icon(Icons.description_outlined),
                    ),
                  ),
                  validator: (value) {
                    if (value != null && value.length > 1000) {
                      return 'La description ne peut dépasser 1000 caractères.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Champ Statut (Dropdown)
                DropdownButtonFormField<TaskStatus>(
                  value: _selectedStatus,
                  decoration: const InputDecoration(
                    labelText: 'Statut *',
                    prefixIcon: Icon(Icons.flag_outlined),
                  ),
                  items: TaskStatus.values.map((status) {
                    return DropdownMenuItem<TaskStatus>(
                      value: status,
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: status.color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(status.label),
                        ],
                      ),
                    );
                  }).toList(),
                  onChanged: isSubmitting
                      ? null
                      : (newStatus) {
                          if (newStatus != null) {
                            setState(() {
                              _selectedStatus = newStatus;
                            });
                          }
                        },
                ),
                const SizedBox(height: 32),

                // Bouton Enregistrer
                ElevatedButton(
                  onPressed: isSubmitting ? null : _saveTask,
                  child: isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : Text(widget.isEditing ? 'Enregistrer les modifications' : 'Créer la tâche'),
                ),
                const SizedBox(height: 12),

                // Bouton Annuler
                OutlinedButton(
                  onPressed: isSubmitting
                      ? null
                      : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Annuler'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
