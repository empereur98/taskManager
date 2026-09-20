/// Configuration globale de l'application mobile Task Manager.
///
/// L'URL de l'API est configurable au lancement via `--dart-define` (cahier des charges § 11.1).
/// Exemple : `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080`
abstract final class AppConfig {
  /// URL de base de l'API Spring Boot.
  ///
  /// Par défaut : `http://localhost:8080` (surchargeable au lancement via `--dart-define=API_BASE_URL=...`).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080',
  );

  /// Délai maximal d'établissement de connexion HTTP (15s pour tolérer cold start).
  static const Duration connectTimeout = Duration(seconds: 15);

  /// Délai maximal de réception de la réponse HTTP (30s).
  static const Duration receiveTimeout = Duration(seconds: 30);
}
