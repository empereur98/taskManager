# Task Manager - Application Mobile (Flutter)

Application mobile Flutter (bonus) consommant la même API Spring Boot que le frontend web (`taskManager-frontend`).

---

## 1. Présentation & Architecture

L'application respecte rigoureusement les spécifications du `cahier_des_charges_mobile_flutter_task_manager.md` et le contrat d'API défini dans `BACKEND_SPECIFICATION.md` :

- **Architecture en couches étanches** :
  - `core/` : Infrastructure technique (Client HTTP Dio, gestion sécurisée du JWT via `flutter_secure_storage`, exceptions unifiées, configuration et thème Material 3).
  - `data/` : Modèles de données (`Task`, `TaskStatus`) et interfaces de repositories (`AuthRepository`, `TaskRepository`) avec leurs implémentations concrètes.
  - `presentation/` : Gestion d'état avec `Provider` (`ChangeNotifier`), widgets réutilisables (`TaskTile`, `StatusChip`, `ErrorView`) et les 3 écrans autorisés (`LoginScreen`, `TasksScreen`, `TaskFormScreen`).
- **Principes de conception (SOLID)** :
  - **S** : Responsabilité unique par classe.
  - **O** : Énumération extensible et typée pour les statuts (`TaskStatus`).
  - **L / I** : Interfaces courtes et ségrégées (`AuthRepository`, `TaskRepository`, `TokenStorage`).
  - **D** : Les providers dépendent des interfaces abstraites, injectées via `MultiProvider` à la racine dans `app.dart`.
- **Garde-fous respectés** :
  - Aucun package non autorisé (pas de `bloc`, pas de `go_router`, pas de `build_runner`, pas de `shared_preferences`).
  - Strictement limitée aux 3 écrans requis (pas d'inscription mobile, compte créé depuis le web).
  - Gestion automatique des erreurs `401 Unauthorized` (déconnexion et vidage de la pile).
  - Permission `INTERNET` déclarée dans `AndroidManifest.xml` et HTTP en clair autorisé uniquement en debug.

---

## 2. Prérequis

- **Flutter SDK** : version `>= 3.0.0` (Dart 3.x avec *null safety*).
- **Plateforme cible principale** : Android (Émulateur Android API 26+ ou appareil physique).
- **Backend Spring Boot** : en cours d'exécution sur le port `8080`.

---

## 3. Configuration de l'URL de l'API

Par défaut, l'application pointe directement sur le backend local : **`http://localhost:8080`**.
Elle est également configurable à l'exécution via `--dart-define=API_BASE_URL=...` :

| Contexte d'exécution | Commande de lancement |
|---|---|
| **Par défaut (Web, Windows, Desktop, Localhost)** | `flutter run` |
| **Émulateur Android** (backend local sur le PC) | `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080` |
| **Appareil physique Android** (même Wi-Fi que le PC) | `flutter run --dart-define=API_BASE_URL=http://<IP-LOCALE-DU-PC>:8080` |
| **Backend déployé sur le Cloud** | `flutter run --dart-define=API_BASE_URL=https://<votre-api-cloud-run>` |

---

## 4. Installation et Commandes Clés

### 4.1 Récupération des dépendances
```bash
flutter pub get
```

### 4.2 Analyse statique du code (Linting)
```bash
flutter analyze
```

### 4.3 Exécution des tests unitaires
```bash
flutter test
```

### 4.4 Démarrage de l'application
```bash
# Lancement direct (utilise http://localhost:8080 par défaut) :
flutter run

# Pour un émulateur Android (redirection vers localhost du PC hôte) :
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

---

## 5. Compte de Test & Synchronisation Web

1. Créez un compte utilisateur depuis le frontend web (`http://localhost:5173/register`).
2. Utilisez ces mêmes identifiants (email et mot de passe) sur l'écran de connexion mobile.
3. Créez, modifiez ou supprimez des tâches sur le mobile : elles seront immédiatement synchronisées avec le web et la base de données partagée.
4. Utilisez le geste **« Tirer pour rafraîchir »** sur la liste mobile pour récupérer instantanément les tâches créées sur le web.
