import 'package:flutter_test/flutter_test.dart';
import 'package:task_manager_mobile/data/models/task.dart';
import 'package:task_manager_mobile/data/models/task_status.dart';

void main() {
  group('TaskStatus Model', () {
    test('fromApiValue parses standard values correctly', () {
      expect(TaskStatus.fromApiValue('TODO'), equals(TaskStatus.todo));
      expect(TaskStatus.fromApiValue('IN_PROGRESS'), equals(TaskStatus.inProgress));
      expect(TaskStatus.fromApiValue('DONE'), equals(TaskStatus.done));
    });

    test('fromApiValue throws FormatException on invalid input', () {
      expect(
        () => TaskStatus.fromApiValue('UNKNOWN_STATUS'),
        throwsA(isA<FormatException>()),
      );
    });

    test('apiValue and label match expected specifications', () {
      expect(TaskStatus.todo.apiValue, equals('TODO'));
      expect(TaskStatus.todo.label, equals('À faire'));

      expect(TaskStatus.inProgress.apiValue, equals('IN_PROGRESS'));
      expect(TaskStatus.inProgress.label, equals('En cours'));

      expect(TaskStatus.done.apiValue, equals('DONE'));
      expect(TaskStatus.done.label, equals('Terminée'));
    });
  });

  group('Task Model', () {
    test('fromJson deserializes complete task object correctly', () {
      final json = <String, dynamic>{
        'id': 10,
        'title': 'Test Task',
        'description': 'Description content',
        'status': 'TODO',
        'createdAt': '2026-09-18T10:00:00Z',
        'updatedAt': '2026-09-18T11:00:00Z',
      };

      final task = Task.fromJson(json);

      expect(task.id, equals(10));
      expect(task.title, equals('Test Task'));
      expect(task.description, equals('Description content'));
      expect(task.status, equals(TaskStatus.todo));
      expect(task.createdAt, equals(DateTime.parse('2026-09-18T10:00:00Z')));
      expect(task.updatedAt, equals(DateTime.parse('2026-09-18T11:00:00Z')));
    });

    test('fromJson converts null description to empty string', () {
      final json = <String, dynamic>{
        'id': 20,
        'title': 'Task without description',
        'description': null,
        'status': 'IN_PROGRESS',
        'createdAt': '2026-09-18T12:00:00Z',
        'updatedAt': '2026-09-18T12:00:00Z',
      };

      final task = Task.fromJson(json);

      expect(task.id, equals(20));
      expect(task.description, equals(''));
      expect(task.status, equals(TaskStatus.inProgress));
    });

    test('toJson produces expected structure with null description when empty', () {
      final task = Task(
        id: 1,
        title: 'Task 1',
        description: '',
        status: TaskStatus.done,
        createdAt: DateTime.parse('2026-09-18T10:00:00Z'),
        updatedAt: DateTime.parse('2026-09-18T10:00:00Z'),
      );

      final json = task.toJson();

      expect(json['id'], equals(1));
      expect(json['title'], equals('Task 1'));
      expect(json['description'], isNull);
      expect(json['status'], equals('DONE'));
    });
  });
}
