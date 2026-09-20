# Spécification du Contrat d'API Backend (Attentes du Frontend)

> **Document de référence pour le développement du backend (Spring Boot)**  
> Ce document définit de manière exhaustive et stricte l'ensemble des besoins, endpoints, formats de requête/réponse et comportements attendus par l'application frontend React (`taskManager-frontend`).  
> *Périmètre : aligné exclusivement sur le code source actuel du frontend.*

---

## Sommaire

1. [Vue d'ensemble et Principes Clés](#1-vue-densemble-et-principes-clés)
2. [Configuration Réseau & CORS](#2-configuration-réseau--cors)
3. [Format Général des Échanges](#3-format-général-des-échanges)
4. [Gestion de l'Authentification & Sécurité (JWT)](#4-gestion-de-lauthentification--sécurité-jwt)
5. [Spécification Détaillée des Endpoints](#5-spécification-détaillée-des-endpoints)
   - [5.1 POST /api/auth/register](#51-post-apiauthregister)
   - [5.2 POST /api/auth/login](#52-post-apiauthlogin)
   - [5.3 GET /api/tasks](#53-get-apitasks)
   - [5.4 POST /api/tasks](#54-post-apitasks)
   - [5.5 PUT /api/tasks/{id}](#55-put-apitasksid)
   - [5.6 DELETE /api/tasks/{id}](#56-delete-apitasksid)
6. [Format Standard des Erreurs](#6-format-standard-des-erreurs)
7. [Tableau Récapitulatif des Codes HTTP](#7-tableau-récapitulatif-des-codes-http)
8. [Traçabilité avec le Code Frontend](#8-traçabilité-avec-le-code-frontend)

---

## 1. Vue d'ensemble et Principes Clés

Le frontend consomme une API RESTful JSON servie par défaut sur `http://localhost:8080` (paramétrable via la variable `VITE_API_URL`).

### Règles Fondamentales de Gestion :
1. **Isolation des données utilisateur (*Multi-tenancy*)** :
   - Chaque tâche appartient à un utilisateur (`User`).
   - Un utilisateur connecté ne peut **jamais** voir, modifier ou supprimer les tâches d'un autre utilisateur.
   - Les endpoints `/api/tasks/**` filtrent automatiquement les données en fonction de l'identité extraite du token JWT.
2. **Pas de pagination requise par le frontend** :
   - `GET /api/tasks` renvoie la liste complète des tâches de l'utilisateur sous forme d'un tableau JSON `Task[]`.
   - Le tri, la recherche textuelle (titre/description) et le filtrage par statut sont assurés directement côté client par le frontend.
3. **Statuts des tâches normalisés** :
   - L'énumération stricte acceptée est : `'TODO' | 'IN_PROGRESS' | 'DONE'`.

---

## 2. Configuration Réseau & CORS

Pour permettre la communication entre le client Vite (`http://localhost:5173`) et le backend Spring Boot (`http://localhost:8080`), le backend doit impérativement autoriser les requêtes CORS :

- **Origines autorisées (*Allowed Origins*)** :  
  `http://localhost:5173`, `http://127.0.0.1:5173` (ou `*` en environnement de dev local).
- **Méthodes HTTP autorisées (*Allowed Methods*)** :  
  `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- **En-têtes autorisés (*Allowed Headers*)** :  
  `Authorization`, `Content-Type`, `Accept`, `X-Requested-With`.
- **Support des requêtes pré-vol (*Pre-flight OPTIONS*)** :  
  Le backend doit répondre avec un statut HTTP `200 OK` ou `204 No Content` aux requêtes `OPTIONS`.

---

## 3. Format Général des Échanges

- **Requêtes avec corps (*Body*)** :
  - En-tête obligatoire : `Content-Type: application/json; charset=UTF-8`
  - Corps encodé en JSON valide.
- **Réponses** :
  - En-tête : `Content-Type: application/json; charset=UTF-8` (sauf statut 204).
  - Dates au format standard ISO-8601 (ex: `2026-09-18T20:30:00Z` ou `2026-09-18T20:30:00`).

---

## 4. Gestion de l'Authentification & Sécurité (JWT)

1. **Routes Publiques (sans token)** :
   - `POST /api/auth/register`
   - `POST /api/auth/login`
2. **Routes Protégées (token obligatoire)** :
   - Toutes les routes sous `/api/tasks/**`
3. **En-tête d'autorisation envoyé par le frontend** :
   ```http
   Authorization: Bearer <token_jwt>
   ```
4. **Comportement en cas de token invalide ou expiré (Statut 401)** :
   - Le frontend intercepte automatiquement tout code `401 Unauthorized`.
   - Il détruit le token local (`localStorage`), affiche une notification `Session expirée ou invalide` et redirige vers la page `/login`.

---

## 5. Spécification Détaillée des Endpoints

### 5.1 POST `/api/auth/register`
*Inscription d'un nouvel utilisateur.*

- **Authentification** : Non requise.
- **Corps de la requête (`RegisterPayload`)** :
  ```json
  {
    "email": "utilisateur@example.com",
    "password": "password123",
    "name": "Jean Dupont"
  }
  ```
  | Champ | Type | Présence | Contraintes frontend |
  |---|---|---|---|
  | `email` | String | Obligatoire | Format email valide, unique |
  | `password` | String | Obligatoire | Au moins 8 caractères |
  | `name` | String | Optionnel | Nom ou pseudonyme |

- **Réponses attendues** :
  - **`201 Created`** (ou `200 OK`) :
    ```json
    {
      "message": "Compte créé avec succès"
    }
    ```
  - **`400 Bad Request`** : Champs manquants ou format invalide.
  - **`409 Conflict`** : L'adresse email existe déjà en base de données :
    ```json
    {
      "status": 409,
      "message": "Cette adresse email est déjà utilisée par un autre compte."
    }
    ```

---

### 5.2 POST `/api/auth/login`
*Connexion et récupération du jeton JWT.*

- **Authentification** : Non requise.
- **Corps de la requête (`LoginPayload`)** :
  ```json
  {
    "email": "utilisateur@example.com",
    "password": "password123"
  }
  ```
  | Champ | Type | Présence | Contraintes frontend |
  |---|---|---|---|
  | `email` | String | Obligatoire | Format email valide |
  | `password` | String | Obligatoire | Chaîne non vide |

- **Réponses attendues** :
  - **`200 OK`** (`AuthResponse`) :
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "utilisateur@example.com",
        "name": "Jean Dupont"
      }
    }
    ```
    > *Note : Le frontend consomme `response.token` en priorité. L'objet `user` est optionnel mais recommandé pour afficher l'email et le nom dans la barre de navigation.*
  - **`401 Unauthorized`** : Email ou mot de passe incorrect :
    ```json
    {
      "status": 401,
      "message": "Identifiants invalides. Vérifiez votre email et mot de passe."
    }
    ```
  - **`400 Bad Request`** : Données manquantes.

---

### 5.3 GET `/api/tasks`
*Récupération de toutes les tâches appartenant à l'utilisateur connecté.*

- **Authentification** : Requise (`Authorization: Bearer <token>`).
- **Paramètres d'URL / Query** : Aucun (pas de pagination, trié côté frontend par date de création).
- **Réponses attendues** :
  - **`200 OK`** (`Task[]`) :
    ```json
    [
      {
        "id": 1,
        "title": "Finaliser la documentation de l'API REST",
        "description": "Rédiger les spécifications OpenAPI et les exemples.",
        "status": "DONE",
        "createdAt": "2026-09-18T10:00:00Z",
        "updatedAt": "2026-09-18T11:00:00Z"
      },
      {
        "id": 2,
        "title": "Intégrer les tests unitaires",
        "description": null,
        "status": "IN_PROGRESS",
        "createdAt": "2026-09-18T12:00:00Z",
        "updatedAt": "2026-09-18T12:30:00Z"
      }
    ]
    ```
    *Si l'utilisateur n'a aucune tâche, renvoyer un tableau vide : `[]`.*
  - **`401 Unauthorized`** : Token absent, invalide ou expiré.

---

### 5.4 POST `/api/tasks`
*Création d'une nouvelle tâche pour l'utilisateur connecté.*

- **Authentification** : Requise (`Authorization: Bearer <token>`).
- **Corps de la requête (`CreateTaskDto`)** :
  ```json
  {
    "title": "Nouvelle tâche urgente",
    "description": "Description détaillée de la tâche à accomplir",
    "status": "TODO"
  }
  ```
  | Champ | Type | Présence | Contraintes |
  |---|---|---|---|
  | `title` | String | Obligatoire | Texte non vide (1 à 255 caractères) |
  | `description` | String | Optionnel | Texte ou `null` |
  | `status` | String (Enum) | Obligatoire | Valeurs : `'TODO'`, `'IN_PROGRESS'`, `'DONE'` |

- **Comportement Backend attendu** :
  - Associer automatiquement la tâche au `User` authentifié via le token.
  - Initialiser `createdAt` et `updatedAt` avec l'horodatage actuel côté serveur.
- **Réponses attendues** :
  - **`201 Created`** (ou `200 OK`) (`Task`) :
    ```json
    {
      "id": 42,
      "title": "Nouvelle tâche urgente",
      "description": "Description détaillée de la tâche à accomplir",
      "status": "TODO",
      "createdAt": "2026-09-19T09:15:00Z",
      "updatedAt": "2026-09-19T09:15:00Z"
    }
    ```
  - **`400 Bad Request`** : Titre absent ou vide, statut invalide.
  - **`401 Unauthorized`** : Non authentifié.

---

### 5.5 PUT `/api/tasks/{id}`
*Modification d'une tâche existante.*

- **Authentification** : Requise (`Authorization: Bearer <token>`).
- **Paramètre d'URL** :
  - `{id}` : Identifiant numérique de la tâche (ex: `/api/tasks/42`).
- **Corps de la requête (`UpdateTaskDto`)** :
  ```json
  {
    "title": "Titre mis à jour",
    "description": "Nouvelle description ou null",
    "status": "IN_PROGRESS"
  }
  ```
  | Champ | Type | Présence | Contraintes |
  |---|---|---|---|
  | `title` | String | Obligatoire | Texte non vide |
  | `description` | String | Optionnel | Texte ou `null` |
  | `status` | String (Enum) | Obligatoire | `'TODO'`, `'IN_PROGRESS'`, `'DONE'` |

- **Comportement Backend attendu** :
  - Vérifier que la tâche `{id}` existe **ET** appartient bien à l'utilisateur connecté.
  - Si la tâche n'appartient pas à l'utilisateur, renvoyer `404 Not Found` (ou `403 Forbidden`).
  - Mettre à jour `updatedAt` avec la date courante.
- **Réponses attendues** :
  - **`200 OK`** (`Task`) :
    ```json
    {
      "id": 42,
      "title": "Titre mis à jour",
      "description": "Nouvelle description ou null",
      "status": "IN_PROGRESS",
      "createdAt": "2026-09-19T09:15:00Z",
      "updatedAt": "2026-09-19T10:00:00Z"
    }
    ```
  - **`400 Bad Request`** : Champs invalides.
  - **`401 Unauthorized`** : Non authentifié.
  - **`404 Not Found`** : Tâche introuvable ou n'appartenant pas à l'utilisateur.

---

### 5.6 DELETE `/api/tasks/{id}`
*Suppression d'une tâche.*

- **Authentification** : Requise (`Authorization: Bearer <token>`).
- **Paramètre d'URL** :
  - `{id}` : Identifiant numérique de la tâche (ex: `/api/tasks/42`).
- **Comportement Backend attendu** :
  - Vérifier que la tâche `{id}` existe **ET** appartient à l'utilisateur connecté.
  - Supprimer l'enregistrement de la base de données.
- **Réponses attendues** :
  - **`204 No Content`** : Corps de réponse vide (statut HTTP standard pris en charge par `client.ts`).
  - *(Optionnel accepté : `200 OK` avec un corps vide `{}` ou `{ "message": "Tâche supprimée" }`).*
  - **`401 Unauthorized`** : Non authentifié.
  - **`404 Not Found`** : Tâche introuvable ou n'appartenant pas à l'utilisateur.

---

## 6. Format Standard des Erreurs

Le client HTTP du frontend (`src/api/client.ts`) extrait le message d'erreur selon la logique suivante :
```typescript
errorMessage = responseData.message || responseData.error || errorMessage;
```

Le backend Spring Boot doit privilégier un format JSON d'erreur cohérent (ex: via un `@RestControllerAdvice`) :

```json
{
  "timestamp": "2026-09-19T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Le titre de la tâche ne peut pas être vide.",
  "errors": {
    "title": "Le titre est obligatoire"
  }
}
```

### Cas spécifiques attendus par le code frontend :
1. **Échec de connexion (401)** :
   - Le message est affiché en alerte rouge dans le formulaire de login :
     `"Identifiants invalides. Vérifiez votre email et mot de passe."`
2. **Conflit email à l'inscription (409)** :
   - Le frontend attend le code HTTP `409` pour afficher spécifiquement :
     `"Cette adresse email est déjà utilisée par un autre compte."`
3. **Session expirée (401 sur requête authentifiée)** :
   - Le frontend déclenche automatiquement l'événement `auth:unauthorized`, vide le `localStorage` et redirige l'utilisateur vers `/login`.

---

## 7. Tableau Récapitulatif des Codes HTTP

| Code HTTP | Cas d'utilisation | Endpoints concernés |
|---|---|---|
| **`200 OK`** | Succès de lecture ou modification | `POST /api/auth/login`, `GET /api/tasks`, `PUT /api/tasks/{id}` |
| **`201 Created`** | Création d'une ressource | `POST /api/auth/register`, `POST /api/tasks` |
| **`204 No Content`** | Suppression réussie sans contenu en retour | `DELETE /api/tasks/{id}` |
| **`400 Bad Request`** | Validation échouée (champ manquant, format invalide) | Tous les `POST` et `PUT` |
| **`401 Unauthorized`** | Identifiants invalides ou token JWT absent/expiré | Tous les endpoints (sauf register/login) |
| **`403 Forbidden`** | Accès refusé (droits insuffisants) | Tous les endpoints protégés |
| **`404 Not Found`** | Tâche introuvable ou appartenant à un autre utilisateur | `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}` |
| **`409 Conflict`** | Conflit d'unicité (email déjà pris) | `POST /api/auth/register` |
| **`500 Internal Server Error`** | Erreur inattendue du serveur / base de données | Tous les endpoints |

---

## 8. Traçabilité avec le Code Frontend

Chaque spécification ci-dessus correspond directement aux fichiers du frontend :

| Fichier Frontend | Rôle & Dépendance Backend |
|---|---|
| [`src/types/index.ts`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/types/index.ts) | Types TypeScript : `Task`, `TaskStatus`, `CreateTaskDto`, `UpdateTaskDto`, `AuthResponse`, `User`, `ApiErrorResponse`. |
| [`src/api/client.ts`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/api/client.ts) | Client fetch global, injection de `Bearer <token>`, gestion des erreurs 401, 204 et parsing JSON. |
| [`src/api/auth.api.ts`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/api/auth.api.ts) | Appels `login` et `register`. |
| [`src/api/tasks.api.ts`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/api/tasks.api.ts) | Appels CRUD : `getTasks`, `createTask`, `updateTask`, `deleteTask`. |
| [`src/pages/LoginPage.tsx`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/pages/LoginPage.tsx) | Gestion de la connexion, stockage du token et redirection. |
| [`src/pages/RegisterPage.tsx`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/pages/RegisterPage.tsx) | Formulaire d'inscription et gestion du conflit 409. |
| [`src/pages/TasksPage.tsx`](file:///c:/Users/user/Desktop/projets/taskManager/taskManager-frontend/src/pages/TasksPage.tsx) | Affichage de la liste, création, mise à jour de statut, suppression. |
