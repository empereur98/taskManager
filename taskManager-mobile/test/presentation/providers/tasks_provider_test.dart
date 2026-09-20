import 'package:flutter_test/flutter_test.dart';
import 'package:task_manager_mobile/data/models/task.dart';
import 'package:task_manager_mobile/data/models/task_status.dart';
import 'package:task_manager_mobile/presentation/providers/tasks_provider.dart';

import '../../mocks/mock_repositories.dart';

void main() {
  late MockTaskRepository mockTaskRepository;
  late TasksProvider tasksProvider;

  setUp(() {
    mockTaskRepository = MockTaskRepository();
    tasksProvider = TasksProvider(taskRepository: mockTaskRepository);
  });

  group('TasksProvider Tests', () {
    test('loadTasks fetches and sorts tasks by date descending', () async {
      final now = DateTime.now().toUtc();
      mockTaskRepository.seedTasks([
        Task(
          id: 1,
          title: 'Older Task',
          description: '',
          status: TaskStatus.todo,
          createdAt: now.subtract(const Duration(hours: 2)),
          updatedAt: now.subtract(const Duration(hours: 2)),
        ),
        Task(
          id: 2,
          title: 'Newer Task',
          description: '',
          status: TaskStatus.inProgress,
          createdAt: now,
          updatedAt: now,
        ),
      ]);

      await tasksProvider.loadTasks();

      expect(tasksProvider.tasks.length, equals(2));
      expect(tasksProvider.tasks.first.id, equals(2));
      expect(tasksProvider.tasks.last.id, equals(1));
      expect(tasksProvider.isLoading, isFalse);
      expect(tasksProvider.errorMessage, isNull);
    });

    test('createTask prepends the newly created task to the list', () async {
      final success = await tasksProvider.createTask(
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.todo,
      );

      expect(success, isTrue);
      expect(tasksProvider.tasks.length, equals(1));
      expect(tasksProvider.tasks.first.title, equals('New Task'));
      expect(tasksProvider.isSubmitting, isFalse);
    });

    test('updateTask updates the target task in place', () async {
      await tasksProvider.createTask(
        title: 'Initial Title',
        description: '',
        status: TaskStatus.todo,
      );
      final createdId = tasksProvider.tasks.first.id;

      final success = await tasksProvider.updateTask(
        id: createdId,
        title: 'Updated Title',
        description: 'Updated Description',
        status: TaskStatus.done,
      );

      expect(success, isTrue);
      expect(tasksProvider.tasks.first.title, equals('Updated Title'));
      expect(tasksProvider.tasks.first.status, equals(TaskStatus.done));
    });

    test('deleteTask removes the task from the list', () async {
      await tasksProvider.createTask(
        title: 'Task to delete',
        description: '',
        status: TaskStatus.todo,
      );
      final createdId = tasksProvider.tasks.first.id;
      expect(tasksProvider.tasks.length, equals(1));

      final success = await tasksProvider.deleteTask(createdId);

      expect(success, isTrue);
      expect(tasksProvider.tasks.isEmpty, isTrue);
    });

    test('loadTasks failure sets errorMessage', () async {
      mockTaskRepository.shouldFail = true;

      await tasksProvider.loadTasks();

      expect(tasksProvider.tasks.isEmpty, isTrue);
      expect(tasksProvider.errorMessage, isNotNull);
      expect(tasksProvider.isLoading, isFalse);
    });
  });
}
