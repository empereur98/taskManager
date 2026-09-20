import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/task_repository.dart';
import 'data/repositories/task_repository_impl.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/tasks_provider.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/tasks_screen.dart';

final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

/// Application racine assemblant les dépendances via [MultiProvider] (cahier des charges § 5 & § 6.1).
class TaskManagerApp extends StatefulWidget {
  final TokenStorage tokenStorage;

  const TaskManagerApp({
    super.key,
    required this.tokenStorage,
  });

  @override
  State<TaskManagerApp> createState() => _TaskManagerAppState();
}

class _TaskManagerAppState extends State<TaskManagerApp> {
  late final ApiClient _apiClient;
  late final AuthRepository _authRepository;
  late final TaskRepository _taskRepository;
  late final AuthProvider _authProvider;

  @override
  void initState() {
    super.initState();

    // Assemblage technique (SOLID - Inversion des dépendances)
    _apiClient = ApiClient(
      tokenStorage: widget.tokenStorage,
      onUnauthorized: () {
        // En cas de 401 sur requête authentifiée : vider la pile et afficher "Session expirée"
        _authProvider.logout('Session expirée. Veuillez vous reconnecter.');
        appNavigatorKey.currentState?.popUntil((route) => route.isFirst);
      },
    );

    _authRepository = AuthRepositoryImpl(_apiClient);
    _taskRepository = TaskRepositoryImpl(_apiClient);

    _authProvider = AuthProvider(
      authRepository: _authRepository,
      tokenStorage: widget.tokenStorage,
    )..init();
  }

  @override
  void dispose() {
    _authProvider.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<TokenStorage>.value(value: widget.tokenStorage),
        Provider<ApiClient>.value(value: _apiClient),
        Provider<AuthRepository>.value(value: _authRepository),
        Provider<TaskRepository>.value(value: _taskRepository),
        ChangeNotifierProvider<AuthProvider>.value(value: _authProvider),
        ChangeNotifierProvider<TasksProvider>(
          create: (_) => TasksProvider(taskRepository: _taskRepository),
        ),
      ],
      child: MaterialApp(
        title: 'Task Manager',
        navigatorKey: appNavigatorKey,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AuthGate(),
      ),
    );
  }
}

/// Porte d'authentification aiguillant vers l'écran adéquat selon l'état de session (§ 9.1).
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final authStatus = context.watch<AuthProvider>().status;

    switch (authStatus) {
      case AuthStatus.unknown:
        return const Scaffold(
          body: Center(
            child: CircularProgressIndicator(),
          ),
        );
      case AuthStatus.authenticated:
        return const TasksScreen();
      case AuthStatus.unauthenticated:
        return const LoginScreen();
    }
  }
}
