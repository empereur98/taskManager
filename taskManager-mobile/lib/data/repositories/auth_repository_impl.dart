import 'package:dio/dio.dart';

import '../../core/errors/app_exception.dart';
import '../../core/network/api_client.dart';
import 'auth_repository.dart';

/// Implémentation concrète de [AuthRepository] appelant l'API Spring Boot.
class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;

  const AuthRepositoryImpl(this._apiClient);

  @override
  Future<String> login({required String email, required String password}) async {
    try {
      final response = await _apiClient.dio.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: <String, dynamic>{
          'email': email.trim(),
          'password': password,
        },
      );

      final data = response.data;
      if (data != null && data['token'] is String) {
        return data['token'] as String;
      }

      throw const AppException('Réponse d\'authentification invalide du serveur.');
    } on DioException catch (dioError) {
      if (dioError.error is AppException) {
        throw dioError.error as AppException;
      }
      throw AppException.fromDioException(dioError, isAuthRequest: true);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException('Une erreur inattendue est survenue : $e');
    }
  }
}
