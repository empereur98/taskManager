import 'package:flutter/foundation.dart';

import '../../core/storage/token_storage.dart';
import '../../data/repositories/auth_repository.dart';

/// Statuts d'authentification possibles de la session utilisateur.
enum AuthStatus {
  unknown,
  authenticated,
  unauthenticated,
}

/// Provider gérant l'état de connexion et le cycle de vie de la session (cahier des charges § 10.2).
///
/// Ne dépend que des abstractions [AuthRepository] et [TokenStorage] (SOLID - Inversion des dépendances).
class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;
  final TokenStorage _tokenStorage;

  AuthStatus _status = AuthStatus.unknown;
  bool _isLoading = false;
  String? _errorMessage;
  String? _sessionExpiredMessage;

  AuthProvider({
    required AuthRepository authRepository,
    required TokenStorage tokenStorage,
  })  : _authRepository = authRepository,
        _tokenStorage = tokenStorage;

  AuthStatus get status => _status;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get sessionExpiredMessage => _sessionExpiredMessage;

  /// Vérifie la présence d'un token stocké au démarrage de l'application.
  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    final token = await _tokenStorage.read();
    if (token != null && token.isNotEmpty) {
      _status = AuthStatus.authenticated;
    } else {
      _status = AuthStatus.unauthenticated;
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Tente de connecter l'utilisateur avec son email et mot de passe.
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    _sessionExpiredMessage = null;
    notifyListeners();

    try {
      final token = await _authRepository.login(email: email, password: password);
      await _tokenStorage.write(token);
      _status = AuthStatus.authenticated;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Déconnecte l'utilisateur en supprimant le token et en réinitialisant l'état.
  Future<void> logout([String? reason]) async {
    await _tokenStorage.clear();
    _status = AuthStatus.unauthenticated;
    _sessionExpiredMessage = reason;
    _errorMessage = null;
    notifyListeners();
  }

  /// Efface le message de session expirée une fois affiché.
  void clearSessionExpiredMessage() {
    _sessionExpiredMessage = null;
  }
}
