# 📋 TaskManager — Monorepo & Guide d'Utilisation

Bienvenue sur le projet **TaskManager**, une plateforme complète de gestion de tâches développée selon les meilleures pratiques DevSecOps.

Le projet est constitué d'une API REST **Spring Boot** (Java 21), d'un client Web **React / Vite / TypeScript**, d'une application mobile **Flutter / Dart** *(bonus)*, et d'un pipeline complet **CI/CD GitHub Actions** automatisant tests, contrôles de sécurité et déploiements.

---

## 🌐 Démo en ligne & Liens d'Accès Rapide

| Support | Type | Lien d'accès | Détails |
|---|---|---|---|
| 💻 **Web** | Application React (Production) | 👉 **[Accéder à l'application Web](https://task-manager-self-pi-69.vercel.app/)** | Hébergée sur **Vercel** |
| 📱 **Mobile** | Application Android (APK Release) | 👉 **[Télécharger l'APK sur GitHub Releases](https://github.com/empereur98/taskManager/releases)** | Compilée & signée par **GitHub Actions** |
| ⚙️ **API REST** | Documentation Swagger UI | 👉 **[Explorer les endpoints Swagger](https://taskmanager-backend-0s8w.onrender.com/swagger-ui/index.html)** | Hébergée sur **Render** |
| 🗄️ **Base de Données** | MySQL Managé Cloud | Dédiée Cloud | Hébergée sur **Aiven** |

> [!TIP]
> **Important concernant l'hébergement gratuit (Render) :**
> Après une période d'inactivité, le serveur backend sur Render entre en veille. Lors de votre première visite, le chargement peut prendre entre 30 et 50 secondes le temps que l'instance se réveille. Le badge de statut en haut à droite du frontend web passera automatiquement au vert 🟢 dès que l'API est opérationnelle.

---

## 📲 Guide de Téléchargement & Installation de l'Application Mobile (Android)

L'application mobile est compilée automatiquement sous forme de fichier **APK Release** prêt à l'emploi à chaque mise à jour sur la branche principale (`main`).

### Étapes d'installation sur votre smartphone Android :

1. **Accéder aux versions publiées :**
   * Rendez-vous sur la page des releases GitHub du projet :  
     👉 **[https://github.com/empereur98/taskManager/releases](https://github.com/empereur98/taskManager/releases)**
2. **Télécharger le fichier APK :**
   * Repérez la dernière version (par exemple `TaskManager Mobile - build ...`).
   * Dépliez la section **Assets** en bas de la release.
   * Cliquez sur le fichier se terminant par `.apk` (ex: `taskmanager-mobile-sha-xxxx.apk`) pour lancer le téléchargement directement sur votre téléphone (ou téléchargez-le sur PC puis transférez-le).
3. **Autoriser l'installation :**
   * Ouvrez le fichier téléchargé depuis vos notifications ou le gestionnaire de fichiers de votre téléphone.
   * Si Android affiche le message de sécurité :  
     *« Pour votre sécurité, votre téléphone n'est pas autorisé à installer des applications inconnues depuis cette source »* :
     1. Appuyez sur **Paramètres**.
     2. Activez l'option **Autoriser cette source** (pour votre navigateur ou gestionnaire de fichiers).
     3. Revenez en arrière.
4. **Finaliser l'installation :**
   * Appuyez sur **Installer**.
   * Une fois l'installation terminée, appuyez sur **Ouvrir** pour lancer TaskManager Mobile.

---

## 📖 Guide d'Utilisation Pas-à-Pas de l'Application

### 1. Inscription d'un nouveau compte (depuis le Web)
> Conformément au cahier des charges et aux normes de sécurité, la création de compte s'effectue sur l'application Web. Le compte ainsi créé est universel et fonctionne à la fois sur le Web et sur le Mobile.

1. Rendez-vous sur la page d'inscription :  
   👉 **[https://task-manager-self-pi-69.vercel.app/register](https://task-manager-self-pi-69.vercel.app/register)**
2. Renseignez :
   * Votre **prénom** et votre **nom**,
   * Une **adresse email** valide,
   * Un **mot de passe** sécurisé (haché avec l'algorithme BCrypt côté backend).
3. Cliquez sur **S'inscrire**. Votre compte est immédiatement activé en base de données.

---

### 2. Connexion à l'application

* **Sur le Web** : Accédez à [la page de connexion](https://task-manager-self-pi-69.vercel.app/login) et saisissez votre email et mot de passe.
* **Sur le Mobile** : Ouvrez l'application Android installée, saisissez les mêmes identifiants et cliquez sur **Se connecter**.

🔐 **Sécurité du JWT :**
* Côté Web, le token JWT est conservé de manière sécurisée en stockage local de session.
* Côté Mobile, le jeton est chiffré au repos via le trousseau sécurisé matériel Android (**Android Keystore / `flutter_secure_storage`**).
* Si votre session expire ou si un code 401 survient, vous êtes redirigé automatiquement vers l'écran d'authentification.

---

### 3. Gestion quotidienne de vos tâches

Une fois connecté, vous disposez d'un espace personnel sécurisé (isolation stricte par utilisateur : vous ne voyez que vos propres tâches).

* ➕ **Créer une tâche** :
  * Cliquez sur le bouton **« Nouvelle tâche »** (Web) ou sur le bouton flottant **`+`** (Mobile).
  * Définissez :
    * Le **titre** (obligatoire),
    * La **description** détaillée,
    * Le **statut initial** : `À FAIRE`, `EN COURS` ou `TERMINÉE`,
    * La **priorité** : `BASSE`, `MOYENNE` ou `HAUTE`,
    * La **date d'échéance** prévisionnelle.
  * Validez la création.
* 🔍 **Filtrer et rechercher** :
  * Recherchez des tâches par mots-clés dans le titre ou la description.
  * Filtrez instantanément par statut (`À FAIRE`, `EN COURS`, `TERMINÉE`) ou par niveau de priorité pour prioriser votre journée.
* ✏️ **Modifier ou changer l'état d'une tâche** :
  * Sur le Web, changez l'état directement ou éditez le contenu via le formulaire dédié.
  * Sur le Mobile, appuyez sur une tâche pour afficher ses détails et mettre à jour ses informations.
* 🗑️ **Supprimer une tâche** :
  * Cliquez sur l'icône de corbeille (Web) ou supprimez la tâche avec confirmation (Mobile).

---

### 4. Synchronisation Multi-Plateforme (Web ↔ Mobile)

Grâce à l'API centralisée et à la base de données Aiven MySQL :
1. Créez une tâche sur votre ordinateur depuis le navigateur Web.
2. Ouvrez votre application Mobile et effectuez le geste **« Tirer pour rafraîchir » (Pull-to-refresh)** sur la liste des tâches : la nouvelle tâche apparaît immédiatement !
3. Terminez la tâche sur votre téléphone mobile : la mise à jour est immédiatement répercutée sur le Web.

---

## 🏗️ Structure du Dépôt (Monorepo)

```
task-manager/
├── .github/
│   ├── workflows/               # Pipelines CI/CD automatisés (GitHub Actions)
│   │   ├── backend-ci.yml       # Build Maven, tests JUnit, JaCoCo, Gitleaks, Trivy, CodeQL
│   │   ├── backend-cd.yml       # Publication Docker GHCR + Déploiement Render
│   │   ├── frontend-ci.yml      # Lint ESLint, tests Vitest, build Vite, Trivy
│   │   ├── frontend-cd.yml      # Déploiement automatique Vercel
│   │   ├── mobile-ci.yml        # Flutter analyze, dart format, tests, coverage, Trivy
│   │   └── mobile-cd.yml        # Compilation APK Release signée + GitHub Release
│   └── dependabot.yml           # Mises à jour automatisées des dépendances
├── taskManager-backend/          # API REST Spring Boot 3 (Java 21)
├── taskManager-frontend/         # Client SPA React 18 + Vite + TypeScript
├── taskManager-mobile/           # Application Mobile Flutter 3.x (Dart)
├── docker-compose.yml            # Environnement complet local (MySQL + Back + Front)
├── README.md                     # Guide complet d'utilisation (ce document)
└── README-CICD.md                # Documentation pédagogique et technique DevSecOps
```

---

## 💻 Démarrage en Environnement Local (Développement)

Si vous souhaitez exécuter le projet sur votre propre machine :

### Option A : Tout-en-un avec Docker Compose (Recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/empereur98/taskManager.git
cd taskManager

# 2. Configurer les variables d'environnement
cp taskManager-backend/.env.example taskManager-backend/.env
cp taskManager-frontend/.env.example taskManager-frontend/.env

# 3. Lancer l'ensemble des conteneurs (Base de données MySQL + Backend + Frontend)
docker compose up --build
```
* **Frontend Web** accessible sur : `http://localhost:5173`
* **Backend API** accessible sur : `http://localhost:8080`
* **Swagger UI** accessible sur : `http://localhost:8080/swagger-ui/index.html`

---

### Option B : Lancement manuel des composants

#### 1. Backend (Spring Boot)
```bash
cd taskManager-backend
./mvnw spring-boot:run
```

#### 2. Frontend (React / Vite)
```bash
cd taskManager-frontend
npm install
npm run dev
```

#### 3. Mobile (Flutter)
```bash
cd taskManager-mobile
flutter pub get

# Pour tester sur un émulateur Android (10.0.2.2 redirige vers le localhost de votre PC) :
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080

# Pour pointer vers l'API de production Render :
flutter run --dart-define=API_BASE_URL=https://taskmanager-backend-0s8w.onrender.com
```

---

## 🛡️ Sécurité & Pipeline DevSecOps

Le projet implémente les principes rigoureux du support DevSecOps :
* **Secret Scanning (Gitleaks)** : Détection immédiate de toute fuite de mot de passe ou clé API avant exécution des builds.
* **Analyse Statique (SAST)** : CodeQL et Sonar/Lint sur l'ensemble des langages.
* **Scan de Dépendances (SCA / Trivy)** : Détection des vulnérabilités CVE sur les bibliothèques tierces et images de conteneurs Docker.
* **Contrôle de Qualité (Quality Gates)** : Seuils stricts de couverture de code (JaCoCo, Vitest, Flutter Coverage).
* **Déploiement Continu (CD)** : Déploiements sans coupure sur Render (Backend), Vercel (Frontend) et GitHub Releases (Mobile APK).

---

## 📚 Documentations Spécifiques

Pour approfondir les détails techniques de chaque brique :
* 📘 [Guide CI/CD & Déploiement détaillé](README-CICD.md)
* ☕ [Documentation Technique Backend Spring Boot](taskManager-backend/README.md)
* ⚛️ [Documentation Technique Frontend React](taskManager-frontend/README.md)
* 📱 [Documentation Technique Mobile Flutter](taskManager-mobile/README.md)
