import 'package:flutter_test/flutter_test.dart';
import 'package:task_manager_mobile/presentation/providers/auth_provider.dart';

import '../../mocks/mock_repositories.dart';

void main() {
  late MockAuthRepository mockAuthRepository;
  late MockTokenStorage mockTokenStorage;
  late AuthProvider authProvider;

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    mockTokenStorage = MockTokenStorage();
    authProvider = AuthProvider(
      authRepository: mockAuthRepository,
      tokenStorage: mockTokenStorage,
    );
  });

  group('AuthProvider Tests', () {
    test('init sets unauthenticated when no token exists', () async {
      await authProvider.init();

      expect(authProvider.status, equals(AuthStatus.unauthenticated));
      expect(authProvider.isLoading, isFalse);
    });

    test('init sets authenticated when a token already exists', () async {
      await mockTokenStorage.write('existing_valid_jwt');

      await authProvider.init();

      expect(authProvider.status, equals(AuthStatus.authenticated));
      expect(authProvider.isLoading, isFalse);
    });

    test('login successfully authenticates and stores the token', () async {
      final success = await authProvider.login('user@test.com', 'password123');

      expect(success, isTrue);
      expect(authProvider.status, equals(AuthStatus.authenticated));
      expect(authProvider.errorMessage, isNull);
      expect(await mockTokenStorage.read(), equals('fake_jwt_token_12345'));
    });

    test('login with error sets errorMessage and remains unauthenticated', () async {
      mockAuthRepository.shouldFail = true;

      final success = await authProvider.login('bad@test.com', 'wrongpassword');

      expect(success, isFalse);
      expect(authProvider.status, equals(AuthStatus.unknown));
      expect(authProvider.errorMessage, contains('Email ou mot de passe incorrect'));
      expect(await mockTokenStorage.read(), isNull);
    });

    test('logout clears the token and sets unauthenticated status', () async {
      await mockTokenStorage.write('token_to_clear');
      await authProvider.init();
      expect(authProvider.status, equals(AuthStatus.authenticated));

      await authProvider.logout('Session expirée.');

      expect(authProvider.status, equals(AuthStatus.unauthenticated));
      expect(authProvider.sessionExpiredMessage, equals('Session expirée.'));
      expect(await mockTokenStorage.read(), isNull);
    });
  });
}
