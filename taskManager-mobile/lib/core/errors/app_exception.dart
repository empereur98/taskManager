import 'package:dio/dio.dart';

/// Exception unifiée de l'application (cahier des charges § 10.3).
///
/// Porte un [message] convivial destiné à l'utilisateur et un [statusCode] optionnel.
class AppException implements Exception {
  final String message;
  final int? statusCode;

  const AppException(this.message, [this.statusCode]);

  /// Fabrique qui transforme une [DioException] en [AppException] compréhensible.
  factory AppException.fromDioException(DioException dioException, {bool isAuthRequest = false}) {
    switch (dioException.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const AppException(
          'Impossible de contacter le serveur. Vérifiez votre connexion.',
        );

      case DioExceptionType.badResponse:
        final statusCode = dioException.response?.statusCode;
        final data = dioException.response?.data;

        // Extraction du message renvoyé par l'API backend Spring Boot
        String? serverMessage;
        if (data is Map<String, dynamic>) {
          if (data['message'] is String && (data['message'] as String).trim().isNotEmpty) {
            serverMessage = data['message'] as String;
          } else if (data['error'] is String && (data['error'] as String).trim().isNotEmpty) {
            serverMessage = data['error'] as String;
          }
        }

        switch (statusCode) {
          case 400:
            return AppException(
              serverMessage ?? 'Données invalides.',
              400,
            );
          case 401:
            if (isAuthRequest) {
              return const AppException(
                'Email ou mot de passe incorrect.',
                401,
              );
            }
            return const AppException(
              'Session expirée. Veuillez vous reconnecter.',
              401,
            );
          case 404:
            return const AppException(
              'Tâche introuvable.',
              404,
            );
          case 409:
            return AppException(
              serverMessage ?? 'Cette adresse ou ressource existe déjà.',
              409,
            );
          case 500:
          default:
            return AppException(
              serverMessage ?? 'Une erreur est survenue. Réessayez plus tard.',
              statusCode,
            );
        }

      case DioExceptionType.cancel:
        return const AppException('Requête annulée.');

      case DioExceptionType.badCertificate:
        return const AppException('Certificat de sécurité invalide.');

      case DioExceptionType.unknown:
      default:
        return const AppException(
          'Impossible de contacter le serveur. Vérifiez votre connexion.',
        );
    }
  }

  @override
  String toString() => message;
}
