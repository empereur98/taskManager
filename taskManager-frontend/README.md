# Task Manager - Frontend Web

Application web moderne et réactive de gestion de tâches développée avec **React 18**, **Vite**, **TypeScript** et **Tailwind CSS**, conforme aux spécifications du cahier des charges (`cahier_des_charges_global_task_manager.md`).

---

## 🚀 Fonctionnalités Clés

- **Authentification complète (JWT)** :
  - Page d'inscription (`/register`) avec validation client (format email, mot de passe ≥ 8 caractères) et toast de succès.
  - Page de connexion (`/login`) avec mémorisation sécurisée du JWT dans `localStorage`.
  - Déconnexion instantanée avec nettoyage de session.
  - Protection des routes : redirection automatique des visiteurs vers `/login` et des utilisateurs connectés vers `/tasks`.
- **Gestion des Tâches (CRUD complet)** :
  - Liste dynamique récupérée depuis `GET /api/tasks`.
  - Ajout de tâches via boîte de dialogue (`POST /api/tasks`).
  - Modification d'une tâche existante pré-remplie (`PUT /api/tasks/{id}`).
  - Confirmation avant suppression via boîte d'alerte (`DELETE /api/tasks/{id}`).
  - Mise à jour instantanée de l'interface sans rechargement de page.
- **Filtrage et Recherche en temps réel** :
  - Sélecteur de statut : *Toutes*, *À faire* (`TODO`), *En cours* (`IN_PROGRESS`), *Terminée* (`DONE`).
  - Recherche insensible à la casse sur le titre et la description.
  - Filtres cumulés s'exécutant côté client avec compteurs dynamiques.
- **Robustesse & Expérience Utilisateur** :
  - Notifications toasts soignées (`sonner`) pour chaque action réussie et erreur API.
  - Interception automatique des erreurs 401 (expiration de session) avec redirection et toast.
  - Désactivation automatique des boutons pendant les requêtes réseau (anti double-soumission).
  - États de chargement et affichage explicite en cas de liste vide ou d'absence de résultat de recherche.
  - Design moderne et responsive (adapté mobile ≥ 360px, tablette et desktop).

---

## 🛠️ Stack Technique

- **Framework & Outil de build** : React 18, Vite 6
- **Langage** : TypeScript 5 (mode `strict`)
- **Styles** : Tailwind CSS, PostCSS, Autoprefixer
- **Icônes & Composants UI** : Lucide React, Sonner (Toasts)
- **Routage** : React Router v6
- **Réseau** : Wrapper natif `fetch` conforme au contrat d'API REST
- **Conteneurisation** : Dockerfile multi-stage avec Nginx

---

## 📦 Structure du Projet

```
taskManager-frontend/
├── src/
│   ├── api/             # Client fetch natif, auth.api.ts, tasks.api.ts
│   ├── components/
│   │   ├── layout/      # Navbar avec profil et bouton déconnexion
│   │   ├── tasks/       # TaskCard, TaskFilters, TaskFormModal
│   │   └── ui/          # Button, Input, Select, Dialog, AlertDialog, Badge
│   ├── context/         # AuthContext (token, login, logout)
│   ├── lib/             # Utilitaires (cn, formatDate)
│   ├── pages/           # LoginPage, RegisterPage, TasksPage
│   ├── routes/          # ProtectedRoute, PublicRoute
│   ├── types/           # Task, User, DTOs
│   ├── App.tsx          # Configuration des routes et Toaster
│   ├── index.css        # Variables CSS et styles Tailwind
│   └── main.tsx         # Point d'entrée React
├── .env.example         # Modèle des variables d'environnement
├── Dockerfile           # Image multi-stage Node/Nginx
├── nginx.conf           # Configuration Nginx pour le SPA
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Démarrage Rapide

### 1. Prérequis
- **Node.js** (version 18+ ou 20+ recommandée)
- **npm** (version 9+)

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Copiez le fichier d'exemple pour définir l'URL de votre API Backend :
```bash
cp .env.example .env
```
Contenu du `.env` :
```env
VITE_API_URL=http://localhost:8080
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application est alors accessible à l'adresse : [http://localhost:5173](http://localhost:5173).

---

## 🏗️ Compilation & Production

### Vérification des types et Build
```bash
npm run build
```
Les fichiers statiques optimisés seront générés dans le dossier `dist/`.

### Prévisualisation locale du bundle de production
```bash
npm run preview
```

---

## 🐳 Déploiement avec Docker

### Construction de l'image Docker
```bash
docker build -t task-manager-frontend .
```

### Exécution du conteneur
```bash
docker run -d -p 80:80 --name task-manager-frontend task-manager-frontend
```
L'application sera disponible sur [http://localhost](http://localhost).
