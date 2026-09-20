import 'package:dio/dio.dart';

import '../../core/errors/app_exception.dart';
import '../../core/network/api_client.dart';
import '../models/task.dart';
import '../models/task_status.dart';
import 'task_repository.dart';

/// Implémentation concrète de [TaskRepository] consommant l'API REST Spring Boot.
class TaskRepositoryImpl implements TaskRepository {
  final ApiClient _apiClient;

  const TaskRepositoryImpl(this._apiClient);

  @override
  Future<List<Task>> fetchAll() async {
    try {
      final response = await _apiClient.dio.get<List<dynamic>>('/api/tasks');
      final data = response.data;
      if (data == null) {
        return <Task>[];
      }

      return data
          .map((item) => Task.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (dioError) {
      if (dioError.error is AppException) {
        throw dioError.error as AppException;
      }
      throw AppException.fromDioException(dioError);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException('Erreur lors du chargement des tâches : $e');
    }
  }

  @override
  Future<Task> create({
    required String title,
    required String description,
    required TaskStatus status,
  }) async {
    try {
      final response = await _apiClient.dio.post<Map<String, dynamic>>(
        '/api/tasks',
        data: <String, dynamic>{
          'title': title.trim(),
          'description': description.trim().isEmpty ? null : description.trim(),
          'status': status.apiValue,
        },
      );

      final data = response.data;
      if (data != null) {
        return Task.fromJson(data);
      }
      throw const AppException('Réponse inattendue lors de la création de la tâche.');
    } on DioException catch (dioError) {
      if (dioError.error is AppException) {
        throw dioError.error as AppException;
      }
      throw AppException.fromDioException(dioError);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException('Erreur lors de la création de la tâche : $e');
    }
  }

  @override
  Future<Task> update({
    required int id,
    required String title,
    required String description,
    required TaskStatus status,
  }) async {
    try {
      final response = await _apiClient.dio.put<Map<String, dynamic>>(
        '/api/tasks/$id',
        data: <String, dynamic>{
          'title': title.trim(),
          'description': description.trim().isEmpty ? null : description.trim(),
          'status': status.apiValue,
        },
      );

      final data = response.data;
      if (data != null) {
        return Task.fromJson(data);
      }
      throw const AppException('Réponse inattendue lors de la modification de la tâche.');
    } on DioException catch (dioError) {
      if (dioError.error is AppException) {
        throw dioError.error as AppException;
      }
      throw AppException.fromDioException(dioError);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException('Erreur lors de la modification de la tâche : $e');
    }
  }

  @override
  Future<void> delete(int id) async {
    try {
      await _apiClient.dio.delete<dynamic>('/api/tasks/$id');
    } on DioException catch (dioError) {
      if (dioError.error is AppException) {
        throw dioError.error as AppException;
      }
      throw AppException.fromDioException(dioError);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException('Erreur lors de la suppression de la tâche : $e');
    }
  }
}
