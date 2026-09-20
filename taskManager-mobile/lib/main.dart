import 'package:flutter/material.dart';

import 'app.dart';
import 'core/storage/token_storage.dart';

/// Point d'entrée de l'application mobile Flutter (cahier des charges § 6.1).
void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Instanciation de la couche de stockage sécurisé du token JWT
  final tokenStorage = SecureTokenStorageImpl();

  runApp(
    TaskManagerApp(tokenStorage: tokenStorage),
  );
}
