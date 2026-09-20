import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../errors/app_exception.dart';
import '../storage/token_storage.dart';

/// Client HTTP unique basé sur [Dio] (cahier des charges § 3.3 et § 10.1).
///
/// Centralise les en-têtes, l'injection du token JWT et l'interception des erreurs (notamment 401).
class ApiClient {
  final Dio dio;
  final TokenStorage tokenStorage;
  final void Function()? onUnauthorized;

  ApiClient({
    required this.tokenStorage,
    this.onUnauthorized,
    Dio? customDio,
  }) : dio = customDio ??
            Dio(
              BaseOptions(
                baseUrl: AppConfig.apiBaseUrl,
                connectTimeout: AppConfig.connectTimeout,
                receiveTimeout: AppConfig.receiveTimeout,
                headers: <String, dynamic>{
                  'Content-Type': 'application/json; charset=UTF-8',
                  'Accept': 'application/json',
                },
              ),
            ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Injection du token Bearer si la requête n'est pas une route d'authentification publique
          final isAuthRoute = options.path.startsWith('/api/auth/');
          if (!isAuthRoute) {
            final token = await tokenStorage.read();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          final isAuthRoute = error.requestOptions.path.startsWith('/api/auth/');

          // Si 401 sur une requête authentifiée : déclencher le callback de session expirée
          if (error.response?.statusCode == 401 && !isAuthRoute) {
            onUnauthorized?.call();
          }

          // Remplacement par notre AppException typée
          final appException = AppException.fromDioException(
            error,
            isAuthRequest: isAuthRoute,
          );

          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: error.type,
              error: appException,
              message: appException.message,
            ),
          );
        },
      ),
    );
  }
}
