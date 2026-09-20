# Cahier des charges global : Task Manager

*Test de recrutement : application web et mobile complète (Spring Boot, React, Flutter, CI/CD)*

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Périmètre](#2-périmètre)
3. [Stack technique imposée](#3-stack-technique-imposée)
4. [Architecture globale](#4-architecture-globale)
5. [Modèle de données](#5-modèle-de-données)
6. [Contrat d'API](#6-contrat-dapi)
7. [Module Backend (Spring Boot)](#7-module-backend-spring-boot)
8. [Module Frontend (React + Vite + TSX)](#8-module-frontend-react--vite--tsx)
9. [Module Mobile Flutter (bonus)](#9-module-mobile-flutter-bonus)
10. [Module CI/CD et déploiement (bonus)](#10-module-cicd-et-déploiement-bonus)
11. [Exigences non fonctionnelles](#11-exigences-non-fonctionnelles)
12. [Organisation du dépôt et livrables](#12-organisation-du-dépôt-et-livrables)
13. [Ordre de réalisation](#13-ordre-de-réalisation)
14. [Critères d'acceptation](#14-critères-dacceptation)
15. [Hypothèses à valider](#15-hypothèses-à-valider)

---

## 1. Présentation du projet

### 1.1 Objectif général

Évaluer la capacité du candidat à **concevoir, développer, déployer et documenter** une application web et mobile complète, en intégrant un backend Java Spring Boot et un frontend React + Vite + TSX, avec une extension mobile Flutter.

### 1.2 Sujet

Développer une mini application de gestion de tâches (**Task Manager**) permettant à un utilisateur de :

- créer un compte et se connecter ;
- ajouter, modifier et supprimer des tâches ;
- visualiser la liste de ses tâches (filtrage par statut et recherche) ;
- synchroniser les tâches entre le web et le mobile ;
- sauvegarder les données dans une API Spring Boot (CRUD complet) ;
- déployer le projet sur GCP avec Docker et CI/CD automatisé *(bonus)*.

---

## 2. Périmètre

### 2.1 Obligatoire

| Module | Contenu |
|---|---|
| Backend | API REST Spring Boot, authentification JWT, CRUD des tâches, base MySQL |
| Frontend | Application React + Vite + TSX : inscription, connexion, gestion des tâches, filtrage, recherche, gestion des erreurs |
| Livrables | Dépôt GitHub public, README clair |

### 2.2 Bonus

| Module | Contenu |
|---|---|
| Mobile | Application Flutter consommant la même API |
| CI/CD | Pipeline GitHub Actions ou Jenkins, images Docker, déploiement GCP |
| Déploiement | Lien déployé (Cloud Run ou Firebase Hosting) |
| Docker Compose | Fichier `docker-compose.yml` pour l'exécution locale (optionnel) |

### 2.3 Hors périmètre

Tout ce qui n'est pas listé dans le sujet : mode sombre, multilingue, pagination, tri avancé, profil utilisateur, mot de passe oublié, rôles et permissions, drag & drop, statistiques, notifications, PWA.

---

## 3. Stack technique imposée

| Domaine | Outils / Technologies |
|---|---|
| Frontend Web | React + Vite + TypeScript (TSX) + Tailwind CSS ou Shadcn UI |
| Backend API | Java Spring Boot + Spring Data JPA + MySQL |
| Sécurité | Spring Security + JWT |
| Mobile *(bonus)* | Flutter + Dart (consommation de la même API) |
| CI/CD et déploiement *(bonus)* | GitHub Actions ou Jenkins + Docker + Google Cloud Platform (Cloud Run ou GCE) |

---

## 4. Architecture globale

```
┌──────────────────┐        ┌──────────────────┐
│  Frontend Web    │        │  Mobile Flutter  │
│  React + Vite    │        │   (bonus)        │
└────────┬─────────┘        └────────┬─────────┘
         │   HTTPS / JSON + JWT      │
         └───────────────┬───────────┘
                         ▼
              ┌────────────────────┐
              │  API Spring Boot   │
              │  Spring Security   │
              │  Spring Data JPA   │
              └─────────┬──────────┘
                        ▼
                  ┌───────────┐
                  │   MySQL   │
                  └───────────┘
```

**Principe de synchronisation web/mobile :** le web et le mobile consomment la **même API** et la **même base de données**. Une tâche créée sur un support est donc visible sur l'autre dès le prochain chargement de la liste. Aucun mécanisme de synchronisation supplémentaire n'est requis.

---

## 5. Modèle de données

### 5.1 Entité `User`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | Long | Clé primaire, auto-générée |
| `email` | String | Unique, obligatoire |
| `password` | String | Obligatoire, stocké haché (BCrypt), jamais renvoyé par l'API |

> Un champ `name` peut être ajouté si le backend l'exige pour l'inscription.

### 5.2 Entité `Task`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | Long | Clé primaire, auto-générée |
| `title` | String | Obligatoire |
| `description` | String | Optionnel |
| `status` | Enum | `TODO`, `IN_PROGRESS`, `DONE` |
| `createdAt` | Date-heure | Renseignée automatiquement à la création |
| `updatedAt` | Date-heure | Mise à jour automatiquement à chaque modification |
| `user` | Relation | Chaque tâche appartient à un utilisateur (`ManyToOne`) |

### 5.3 Relation

Un `User` possède plusieurs `Task`. Un utilisateur ne voit et ne manipule que ses propres tâches.

---

## 6. Contrat d'API

| Méthode | Endpoint | Auth | Usage |
|---|---|---|---|
| POST | `/api/auth/register` | Non | Inscription d'un utilisateur |
| POST | `/api/auth/login` | Non | Connexion, retourne un JWT |
| GET | `/api/tasks` | Oui | Liste des tâches de l'utilisateur connecté |
| POST | `/api/tasks` | Oui | Création d'une tâche |
| PUT | `/api/tasks/{id}` | Oui | Modification d'une tâche |
| DELETE | `/api/tasks/{id}` | Oui | Suppression d'une tâche |

Les requêtes authentifiées envoient l'en-tête :

```
Authorization: Bearer <token>
```

### 6.1 Exemples de corps de requête et de réponse

**Inscription et connexion** (requête) :

```json
{ "email": "user@example.com", "password": "motdepasse123" }
```

**Connexion** (réponse) :

```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

**Création et modification d'une tâche** (requête) :

```json
{ "title": "Préparer la réunion", "description": "Rassembler les documents", "status": "TODO" }
```

**Tâche** (réponse) :

```json
{
  "id": 1,
  "title": "Préparer la réunion",
  "description": "Rassembler les documents",
  "status": "TODO",
  "createdAt": "2026-09-12T09:30:00",
  "updatedAt": "2026-09-15T14:10:00"
}
```

### 6.2 Codes de réponse attendus

| Code | Signification |
|---|---|
| 200 | Succès (lecture, modification) |
| 201 | Ressource créée |
| 204 | Suppression réussie |
| 400 | Données invalides |
| 401 | Non authentifié ou token invalide / expiré |
| 403 | Accès interdit |
| 404 | Ressource introuvable |
| 409 | Conflit (ex. email déjà utilisé) |
| 500 | Erreur serveur |

---

## 7. Module Backend (Spring Boot)

**Objectif :** construire une API RESTful simple, sécurisée par JWT.

### 7.1 Exigences fonctionnelles

| Réf. | Exigence |
|---|---|
| RB-01 | `POST /api/auth/register` crée un utilisateur. L'email doit être unique (409 sinon) et les champs valides (400 sinon). |
| RB-02 | Le mot de passe est haché (BCrypt) avant enregistrement et n'est jamais renvoyé dans une réponse. |
| RB-03 | `POST /api/auth/login` vérifie les identifiants et retourne un JWT. Identifiants invalides : 401. |
| RB-04 | Le JWT est signé, possède une durée de validité, et sa clé secrète est fournie par configuration (jamais en dur). |
| RB-05 | Tous les endpoints `/api/tasks/**` exigent un JWT valide (401 sinon). Les endpoints `/api/auth/**` sont publics. |
| RB-06 | `GET /api/tasks` retourne uniquement les tâches de l'utilisateur connecté. |
| RB-07 | `POST /api/tasks` crée une tâche rattachée à l'utilisateur connecté. `createdAt` et `updatedAt` sont renseignés automatiquement. |
| RB-08 | `PUT /api/tasks/{id}` modifie titre, description et statut. `updatedAt` est mis à jour. Seul le propriétaire peut modifier (404 si la tâche n'existe pas ou n'appartient pas à l'utilisateur). |
| RB-09 | `DELETE /api/tasks/{id}` supprime la tâche. Seul le propriétaire peut supprimer (404 sinon). |
| RB-10 | Validation des entrées : `title` obligatoire, `status` limité aux valeurs `TODO`, `IN_PROGRESS`, `DONE`. |
| RB-11 | Les erreurs sont renvoyées dans un format JSON cohérent (code, message, date). |
| RB-12 | CORS configuré pour autoriser l'origine du frontend (`http://localhost:5173` en développement). |

### 7.2 Exigences techniques

- Java avec Spring Boot, Spring Web, Spring Data JPA, Spring Security.
- Base de données MySQL.
- Architecture en couches : `controller`, `service`, `repository`, `entity`, `dto`, `security`, `config`.
- Configuration externalisée (URL de la base, identifiants, clé JWT) via variables d'environnement ou `application.properties`.
- Docker Compose pour lancer MySQL en local *(optionnel)*.

---

## 8. Module Frontend (React + Vite + TSX)

**Objectif :** créer une interface utilisateur moderne consommant l'API du backend.

### 8.1 Stack et choix techniques

| Domaine | Choix |
|---|---|
| Framework | React 18+ avec Vite |
| Langage | TypeScript (fichiers `.tsx`, mode `strict`) |
| UI | Tailwind CSS, avec composants Shadcn UI (Button, Input, Select, Dialog, AlertDialog, Toast/Sonner) |
| Routing | React Router |
| Appels API | `fetch` natif, dans un wrapper unique (pas d'axios) |
| État | React Context (session) et hooks (`useState`, `useEffect`), sans Redux |
| Config | Variable d'environnement `VITE_API_URL` |

### 8.2 Authentification

| Réf. | Exigence |
|---|---|
| RF-01 | Une page **Inscription** contient un formulaire (nom ou email, mot de passe) qui appelle `POST /api/auth/register`. |
| RF-02 | En cas de succès, un toast de confirmation s'affiche et l'utilisateur est redirigé vers la page de connexion. |
| RF-03 | Une page **Connexion** contient un formulaire (email, mot de passe) qui appelle `POST /api/auth/login`. |
| RF-04 | En cas de succès, le token JWT est stocké et l'utilisateur est redirigé vers la liste des tâches. |
| RF-05 | Les champs sont validés côté client avant envoi (champs requis, format email, longueur minimale du mot de passe), avec messages d'erreur sous chaque champ. |
| RF-06 | Un bouton **Déconnexion** supprime le token et ramène à la page de connexion. |
| RF-07 | Les pages privées sont inaccessibles sans token (redirection vers `/login`). Un utilisateur déjà connecté qui va sur `/login` ou `/register` est redirigé vers `/tasks`. |

### 8.3 Gestion des tâches

| Réf. | Exigence |
|---|---|
| RF-08 | Au chargement de la page, la liste est récupérée via `GET /api/tasks`. Un indicateur de chargement s'affiche pendant l'appel. |
| RF-09 | Chaque tâche affiche : titre, description, statut (badge visuel), date de création, date de dernière modification. |
| RF-10 | Un état vide s'affiche quand il n'y a aucune tâche, ou aucun résultat après filtrage. |
| RF-11 | Un bouton **Ajouter** ouvre un formulaire (Dialog) avec titre (requis), description et statut. La soumission appelle `POST /api/tasks`. |
| RF-12 | Un bouton **Modifier** par tâche ouvre le même formulaire pré-rempli. La soumission appelle `PUT /api/tasks/{id}`. |
| RF-13 | Un bouton **Supprimer** par tâche ouvre une confirmation (AlertDialog). La confirmation appelle `DELETE /api/tasks/{id}`. |
| RF-14 | Après chaque opération réussie, la liste est mise à jour sans rechargement de page, et un toast de succès s'affiche. |

### 8.4 Filtrage et recherche

| Réf. | Exigence |
|---|---|
| RF-15 | Un sélecteur filtre par statut : *Tous*, *À faire*, *En cours*, *Terminée*. |
| RF-16 | Un champ de recherche filtre sur le titre et la description, sans tenir compte de la casse. |
| RF-17 | Filtre et recherche se cumulent et se mettent à jour en temps réel. |
| RF-18 | Comme l'API ne définit aucun paramètre de requête sur `GET /api/tasks`, le filtrage et la recherche se font **côté client**, sur la liste déjà chargée. |

### 8.5 Gestion des erreurs

| Réf. | Exigence |
|---|---|
| RF-19 | Toute erreur API (réseau, 400, 401, 403, 404, 409, 500) produit un toast d'erreur avec un message compréhensible. |
| RF-20 | Sur la connexion, un identifiant invalide affiche une alerte claire dans le formulaire. |
| RF-21 | Une erreur 401 sur une page privée (token expiré ou invalide) supprime le token, redirige vers `/login` et affiche un toast. |
| RF-22 | Pendant un appel API, les boutons de soumission sont désactivés pour éviter les doubles envois. |

### 8.6 Pages et navigation

| Route | Page | Accès |
|---|---|---|
| `/register` | Inscription | Public |
| `/login` | Connexion | Public |
| `/tasks` | Liste et gestion des tâches | Privé |
| `/` | Redirection vers `/tasks` (ou `/login` si non connecté) | — |

### 8.7 Structure du dossier `frontend/`

```
frontend/
├── src/
│   ├── api/          # client fetch (wrapper), auth.api.ts, tasks.api.ts
│   ├── components/   # ui/ (shadcn), TaskCard, TaskForm, TaskFilters...
│   ├── context/      # AuthContext (token, login, logout)
│   ├── pages/        # LoginPage, RegisterPage, TasksPage
│   ├── routes/       # ProtectedRoute, PublicRoute
│   ├── types/        # Task, User, DTO d'API
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── tailwind.config / vite.config.ts / tsconfig.json
└── README.md
```

---

## 9. Module Mobile Flutter (bonus)

**Objectif :** reproduire l'interface principale (liste et création de tâches).

| Réf. | Exigence |
|---|---|
| RM-01 | Écran de connexion appelant `POST /api/auth/login` et utilisant le même JWT que le web. |
| RM-02 | Stockage du token sur l'appareil et envoi de l'en-tête `Authorization: Bearer <token>` à chaque requête authentifiée. |
| RM-03 | Écran principal affichant la liste des tâches de l'utilisateur (`GET /api/tasks`) dans un `ListView`. |
| RM-04 | Création d'une tâche via un formulaire (`TextField`, `ElevatedButton`) appelant `POST /api/tasks`. |
| RM-05 | Gestion des tâches : modification et suppression (`PUT` et `DELETE`). |
| RM-06 | Gestion des erreurs API avec un message visible (SnackBar ou équivalent). |
| RM-07 | Les appels API utilisent `dio` ou `http`. |
| RM-08 | Interface épurée, cohérente avec le web. |

**Adresse de l'API :** configurable. Sur un émulateur Android, `localhost` de la machine est joignable via `10.0.2.2`.

---

## 10. Module CI/CD et déploiement (bonus)

**Objectif :** montrer une compréhension des outils DevOps.

| Réf. | Exigence |
|---|---|
| RD-01 | Pipeline CI/CD avec GitHub Actions ou Jenkins, déclenché à chaque push sur la branche principale. |
| RD-02 | Étape de build et de test du backend. |
| RD-03 | Étape de build et de test du frontend. |
| RD-04 | Build des images Docker (backend et frontend). |
| RD-05 | Déploiement sur GCP : Cloud Run ou VM dockerisée (GCE). |
| RD-06 | Fichier `docker-compose.yml` pour l'exécution locale *(optionnel)*. |
| RD-07 | Secrets (clé JWT, identifiants de base de données, clés GCP) stockés dans les secrets du CI, jamais dans le dépôt. |

**Dockerfiles attendus :**

- Backend : build Maven ou Gradle, exécution du JAR sur une image JRE.
- Frontend : build Vite, contenu statique servi par Nginx.

---

## 11. Exigences non fonctionnelles

| Domaine | Exigence |
|---|---|
| Sécurité | Mots de passe hachés, JWT signé avec expiration, secrets externalisés, CORS restreint. |
| Qualité du code | Code lisible, séparation des responsabilités, nommage cohérent. TypeScript strict et ESLint côté frontend. |
| Responsive | Frontend utilisable sur mobile (≥ 360 px), tablette et desktop. |
| Accessibilité | Labels associés aux champs, boutons explicites, focus visible. |
| Configuration | Aucune URL ni secret en dur : variables d'environnement (`VITE_API_URL`, `.env.example`, `application.properties`). |
| Navigateurs | Dernières versions de Chrome, Firefox, Edge. |
| Documentation | README clair, instructions reproductibles. |

---

## 12. Organisation du dépôt et livrables

### 12.1 Structure du dépôt

Un dépôt GitHub **public**, en monorepo :

```
task-manager/
├── backend/          # API Spring Boot
├── frontend/         # React + Vite + TSX
├── mobile/           # Flutter (bonus)
├── docker-compose.yml   # optionnel
├── .github/workflows/   # CI/CD (bonus)
└── README.md
```

### 12.2 Livrables

- Lien du dépôt GitHub public.
- `README.md` clair contenant :
  - les instructions d'installation et d'exécution ;
  - la description technique rapide (architecture, choix techniques) ;
  - des captures d'écran si possible.
- **Bonus :** lien de l'application déployée (Cloud Run ou Firebase Hosting).

---

## 13. Ordre de réalisation

| Étape | Contenu | Statut |
|---|---|---|
| 1 | Backend Spring Boot | Obligatoire |
| 2 | Frontend React + Vite + TSX | Obligatoire |
| 3 | Application mobile Flutter | Bonus |
| 4 | CI/CD et déploiement GCP | Bonus |

> **Choix actuel :** le développement commence par le **frontend**, en s'appuyant sur le contrat d'API de la section 6. Le backend suivra en respectant ce même contrat.

---

## 14. Critères d'acceptation

### 14.1 Backend

- [ ] L'inscription crée un utilisateur et refuse un email déjà utilisé.
- [ ] La connexion retourne un JWT valide.
- [ ] Les endpoints `/api/tasks` refusent toute requête sans JWT valide.
- [ ] Un utilisateur ne voit et ne modifie que ses propres tâches.
- [ ] Le CRUD complet des tâches fonctionne.
- [ ] `createdAt` et `updatedAt` sont gérés automatiquement.

### 14.2 Frontend

- [ ] Un utilisateur peut s'inscrire, se connecter et se déconnecter.
- [ ] Les pages privées sont inaccessibles sans token.
- [ ] La liste des tâches se charge depuis l'API.
- [ ] Ajout, modification et suppression fonctionnent et la liste se met à jour sans rechargement.
- [ ] Le filtre par statut et la recherche fonctionnent, seuls ou combinés.
- [ ] Les erreurs API affichent un toast ou une alerte, y compris le cas 401.
- [ ] L'interface est responsive.

### 14.3 Mobile *(bonus)*

- [ ] Connexion avec le même compte que le web.
- [ ] Une tâche créée sur le web apparaît sur le mobile, et inversement.
- [ ] Liste, création, modification et suppression fonctionnent.

### 14.4 CI/CD *(bonus)*

- [ ] Le pipeline construit et teste le backend et le frontend.
- [ ] Les images Docker sont construites.
- [ ] L'application est déployée sur GCP et accessible via un lien.

### 14.5 Livrables

- [ ] Le dépôt GitHub est public.
- [ ] Le projet se lance avec les seules instructions du README.

---

## 15. Hypothèses à valider

Le document de test ne précise pas ces éléments, des hypothèses ont donc été posées :

1. **Valeurs de `status`** : `TODO`, `IN_PROGRESS`, `DONE`.
2. **Champs d'inscription** : email et mot de passe (ajouter un nom si le backend l'exige).
3. **Réponse du login** : un objet contenant le token, par exemple `{ "token": "..." }`.
4. **Règles du mot de passe** : minimum 8 caractères.
5. **CORS** : le backend autorise l'origine du frontend (`http://localhost:5173` en développement).
6. **Propriété des tâches** : une tâche appartient à un seul utilisateur, qui est le seul à pouvoir la lire, la modifier ou la supprimer.
7. **Stockage du token côté web** : `localStorage` (choix le plus simple pour ce test, à documenter dans le README).
8. **Filtrage et recherche** : réalisés côté client, l'API ne définissant aucun paramètre de requête sur `GET /api/tasks`.
