import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Interface pour le stockage persistant et sécurisé du jeton d'authentification JWT (SOLID - Interface Segregation).
abstract interface class TokenStorage {
  /// Récupère le token JWT sauvegardé, ou `null` s'il n'existe pas.
  Future<String?> read();

  /// Enregistre le [token] JWT.
  Future<void> write(String token);

  /// Supprime le token JWT stocké (déconnexion ou session expirée).
  Future<void> clear();
}

/// Implémentation sécurisée basée sur [FlutterSecureStorage] (Keystore Android / Keychain iOS).
class SecureTokenStorageImpl implements TokenStorage {
  static const String _tokenKey = 'jwt_auth_token';

  final FlutterSecureStorage _storage;

  const SecureTokenStorageImpl([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> write(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _tokenKey);
  }
}
