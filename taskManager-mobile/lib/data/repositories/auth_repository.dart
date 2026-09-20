/// Contrat du repository d'authentification (SOLID - Interface Segregation).
abstract interface class AuthRepository {
  /// Authentifie l'utilisateur via son [email] et son [password].
  ///
  /// Retourne le jeton JWT renvoyé par l'API backend.
  /// Lève une [AppException] en cas d'échec (ex: 401 Identifiants invalides).
  Future<String> login({required String email, required String password});
}
