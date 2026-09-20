import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../data/models/task.dart';
import '../providers/auth_provider.dart';
import '../providers/tasks_provider.dart';
import '../widgets/error_view.dart';
import '../widgets/task_tile.dart';
import 'task_form_screen.dart';

/// Écran principal affichant la liste des tâches (cahier des charges § 9.3).
class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TasksProvider>().loadTasks();
    });
  }

  Future<void> _handleRefresh() async {
    await context.read<TasksProvider>().loadTasks();
  }

  void _navigateToCreate() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const TaskFormScreen(),
      ),
    );
  }

  void _navigateToEdit(Task task) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => TaskFormScreen(taskToEdit: task),
      ),
    );
  }

  Future<void> _confirmDelete(Task task) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Confirmer la suppression'),
        content: Text('Voulez-vous vraiment supprimer la tâche "${task.title}" ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(dialogContext).colorScheme.error,
            ),
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    final tasksProvider = context.read<TasksProvider>();
    final success = await tasksProvider.deleteTask(task.id);

    if (!mounted) return;

    final messenger = ScaffoldMessenger.of(context);
    messenger.hideCurrentSnackBar();

    if (success) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Tâche supprimée avec succès.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(
          content: Text(tasksProvider.errorMessage ?? 'Erreur lors de la suppression.'),
          backgroundColor: Theme.of(context).colorScheme.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleLogout() async {
    final authProvider = context.read<AuthProvider>();
    final tasksProvider = context.read<TasksProvider>();

    tasksProvider.clear();
    await authProvider.logout();
  }

  @override
  Widget build(BuildContext context) {
    final tasksProvider = context.watch<TasksProvider>();
    final isLoading = tasksProvider.isLoading;
    final errorMessage = tasksProvider.errorMessage;
    final tasks = tasksProvider.tasks;

    Widget bodyContent;

    if (isLoading && tasks.isEmpty) {
      bodyContent = const Center(
        child: CircularProgressIndicator(),
      );
    } else if (errorMessage != null && tasks.isEmpty) {
      bodyContent = ErrorView(
        message: errorMessage,
        onRetry: _handleRefresh,
      );
    } else if (tasks.isEmpty) {
      bodyContent = RefreshIndicator(
        onRefresh: _handleRefresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.6,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.inbox_outlined,
                      size: 64,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Aucune tâche pour le moment',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Créez-en une en appuyant sur "Ajouter".',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      bodyContent = RefreshIndicator(
        onRefresh: _handleRefresh,
        child: ListView.builder(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return TaskTile(
              key: ValueKey(task.id),
              task: task,
              onEdit: () => _navigateToEdit(task),
              onDelete: () => _confirmDelete(task),
            );
          },
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Manager'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Déconnexion',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: bodyContent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToCreate,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Ajouter'),
      ),
    );
  }
}
