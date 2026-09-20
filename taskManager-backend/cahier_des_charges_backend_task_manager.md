# Cahier des charges Backend : Task Manager

*API REST Java Spring Boot : Spring Security (JWT), Spring Data JPA, MySQL*

---

## Table des matières

1. [Objectif et usage du document](#1-objectif-et-usage-du-document)
2. [Périmètre](#2-périmètre)
3. [Stack technique](#3-stack-technique)
4. [Architecture 3 tiers](#4-architecture-3-tiers)
5. [Application des principes SOLID](#5-application-des-principes-solid)
6. [Structure du projet et conventions](#6-structure-du-projet-et-conventions)
7. [Modèle de données](#7-modèle-de-données)
8. [Contrat d'API détaillé](#8-contrat-dapi-détaillé)
9. [Exigences fonctionnelles](#9-exigences-fonctionnelles)
10. [Sécurité](#10-sécurité)
11. [Gestion des erreurs](#11-gestion-des-erreurs)
12. [Configuration et environnement](#12-configuration-et-environnement)
13. [Tests](#13-tests)
14. [Bonnes pratiques transverses](#14-bonnes-pratiques-transverses)
15. [Garde-fous : ce qu'il ne faut pas faire](#15-garde-fous--ce-quil-ne-faut-pas-faire)
16. [Plan de réalisation](#16-plan-de-réalisation)
17. [Checklist de conformité](#17-checklist-de-conformité)
18. [Critères d'acceptation](#18-critères-dacceptation)
19. [Livrables](#19-livrables)
20. [Hypothèses à valider](#20-hypothèses-à-valider)

---

## 1. Objectif et usage du document

### 1.1 Objectif

Construire une **API RESTful simple** qui permet à un utilisateur de créer un compte, de se connecter (JWT) et de gérer ses tâches (CRUD complet). Elle est consommée par le frontend React et, en bonus, par l'application Flutter.

### 1.2 Double rôle du document

1. **Spécification** : ce qu'il faut construire, avec quelles technologies et quelles règles de conception.
2. **Garde-fou** : ce qu'il ne faut **pas** construire. Le test demande une API volontairement simple. Toute fonctionnalité absente du sujet est hors cadre et doit être refusée, même si elle semble utile.

### 1.3 Règle de décision

Avant d'ajouter une classe, un endpoint, une dépendance ou une fonctionnalité, poser la question :

> **Est-ce exigé par le sujet du test, ou nécessaire au bon fonctionnement d'une exigence du sujet ?**
> Si non : ne pas le faire.

La qualité attendue porte sur **la propreté de l'architecture** (3 tiers, SOLID, sécurité) et non sur le nombre de fonctionnalités.

---

## 2. Périmètre

### 2.1 Inclus (exigé par le sujet)

| Élément | Détail |
|---|---|
| Inscription | `POST /api/auth/register` |
| Connexion | `POST /api/auth/login`, retourne un JWT |
| Liste des tâches | `GET /api/tasks`, tâches de l'utilisateur connecté |
| Création | `POST /api/tasks` |
| Modification | `PUT /api/tasks/{id}` |
| Suppression | `DELETE /api/tasks/{id}` |
| Entités | `User`, `Task` (`title`, `description`, `status`, `createdAt`, `updatedAt`) |
| Base de données | MySQL, via Spring Data JPA |
| Authentification | JWT avec Spring Security |
| Docker Compose | Optionnel, pour lancer MySQL en local |

### 2.2 Implicite (nécessaire au bon fonctionnement)

Ces éléments ne sont pas listés mot pour mot dans le sujet mais sont indispensables pour que les exigences fonctionnent correctement et de façon sûre :

- hachage du mot de passe (BCrypt) ;
- validation des entrées ;
- format d'erreur JSON cohérent ;
- réponses 401 propres pour les requêtes non authentifiées ;
- configuration CORS pour le frontend ;
- isolation des données par utilisateur (chacun ne voit que ses tâches) ;
- configuration externalisée (secrets, base de données) ;
- tests automatisés ciblés (nécessaires à l'étape « build et test » du CI/CD bonus).

### 2.3 Exclu (voir aussi la section 15)

Rôles et permissions, refresh token, endpoint de déconnexion, pagination, tri et filtrage côté serveur, endpoint de détail d'une tâche, gestion de profil, réinitialisation de mot de passe, vérification d'email, documentation OpenAPI/Swagger, cache, messagerie, WebSocket, migrations Flyway/Liquibase.

> **Note sur la synchronisation web/mobile :** elle est assurée par le simple fait que les deux clients utilisent la même API et la même base. Aucun mécanisme de synchronisation dédié n'est à développer côté backend.

---

## 3. Stack technique

### 3.1 Technologies imposées

| Domaine | Choix |
|---|---|
| Langage | Java 17 minimum (21 LTS recommandé) |
| Framework | Spring Boot (dernière version stable au démarrage du projet ; la version retenue est notée dans le README) |
| Persistance | Spring Data JPA (Hibernate) |
| Base de données | MySQL 8.x |
| Sécurité | Spring Security + JWT |
| Build | Maven (avec wrapper `mvnw`) |
| Tests | JUnit 5, Mockito, MockMvc, `spring-security-test` |

### 3.2 Dépendances autorisées

| Dépendance | Usage |
|---|---|
| `spring-boot-starter-web` | API REST |
| `spring-boot-starter-data-jpa` | Persistance |
| `spring-boot-starter-security` | Sécurité |
| `spring-boot-starter-validation` | Validation des DTO |
| `mysql-connector-j` | Driver MySQL |
| `jjwt` (api, impl, jackson) | Génération et validation des JWT |
| `spring-boot-starter-test`, `spring-security-test` | Tests |
| `h2` (scope `test` uniquement) | Base en mémoire pour les tests |
| `mysql-socket-factory-connector-j` *(bonus, à ajouter avec le module CI/CD)* | Connexion à Cloud SQL lors du déploiement sur GCP. Aucun impact en local. |
| Lombok *(optionnel, usage limité)* | `@RequiredArgsConstructor`, `@Getter`, `@Setter` ; jamais `@Data` sur une entité JPA |

> Toute autre dépendance nécessite une justification liée à une exigence du sujet.

### 3.3 Dépendances interdites

Spring Cloud, Redis, Kafka/RabbitMQ, Swagger/springdoc, MapStruct *(mapping manuel, suffisant pour 2 entités)*, Flyway/Liquibase, Spring Session, OAuth2, bibliothèques utilitaires non justifiées.

---

## 4. Architecture 3 tiers

### 4.1 Vue d'ensemble

```
        Requête HTTP (JSON + JWT)
                  │
                  ▼
┌──────────────────────────────────────────┐
│  TIER 1 : PRÉSENTATION                   │
│  controller/  dto/  exception/(handler)  │
│  Rôle : HTTP, validation, mapping        │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│  TIER 2 : MÉTIER                         │
│  service/ (interfaces) + service/impl/   │
│  Rôle : règles de gestion, transactions  │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│  TIER 3 : DONNÉES                        │
│  repository/  entity/                    │
│  Rôle : accès à MySQL via JPA            │
└──────────────────┬───────────────────────┘
                   ▼
               MySQL

  Transverse : security/ (JWT, filtre) et config/
```

### 4.2 Responsabilités par tier

| Tier | Contient | Responsable de | Ne fait **jamais** |
|---|---|---|---|
| Présentation | `AuthController`, `TaskController`, DTO, `GlobalExceptionHandler` | Recevoir la requête, déclencher la validation (`@Valid`), appeler le service, choisir le code HTTP | Logique métier, accès aux repositories, manipulation d'entités JPA |
| Métier | `AuthService`, `TaskService` et leurs implémentations, mappers | Règles de gestion (unicité de l'email, propriété des tâches), orchestration, transactions, conversion entité ↔ DTO | Dépendre de classes HTTP (`HttpServletRequest`, `ResponseEntity`) |
| Données | `UserRepository`, `TaskRepository`, entités | Persistance et requêtes | Logique métier, dépendance vers les couches supérieures |

### 4.3 Règles de dépendance

1. Le flux est **strictement descendant** : Présentation → Métier → Données. Jamais l'inverse.
2. Un controller **n'appelle jamais** un repository directement.
3. Les **entités JPA ne sortent jamais** de l'API : les échanges se font uniquement par DTO.
4. Les services **retournent des DTO** (et non des entités), ce qui évite les problèmes de chargement paresseux (`open-in-view` est désactivé).
5. Les services sont transactionnels (`@Transactional`, `readOnly = true` pour les lectures).
6. Le package `security` et le package `config` sont **transverses** : ils configurent l'infrastructure sans contenir de règle métier.

---

## 5. Application des principes SOLID

| Principe | Application concrète dans ce projet |
|---|---|
| **S** : Responsabilité unique | Une classe, une raison de changer. `TaskController` gère HTTP ; `TaskServiceImpl` gère les règles métier ; `TaskMapper` convertit ; `JwtService` gère les tokens ; `JwtAuthenticationFilter` extrait et valide le token de la requête ; `GlobalExceptionHandler` produit les réponses d'erreur. Les entités ne contiennent aucune logique de sécurité (`User` n'implémente pas `UserDetails`, c'est `CustomUserDetailsService` qui adapte). |
| **O** : Ouvert / fermé | Ajouter un nouveau type d'erreur = ajouter une exception et un `@ExceptionHandler`, sans modifier le code existant. Le statut est un `enum` (`TaskStatus`) : ajouter une valeur ne touche pas la logique des services. |
| **L** : Substitution de Liskov | Les exceptions métier héritent d'une base commune et sont interchangeables pour le handler. Toute implémentation de `TaskService` respecte le contrat de l'interface (mêmes exceptions, mêmes garanties) : elle peut être remplacée par un mock dans les tests sans changer le comportement attendu. |
| **I** : Ségrégation des interfaces | Deux interfaces courtes et ciblées : `AuthService` (`register`, `login`) et `TaskService` (`findAll`, `create`, `update`, `delete`). Pas de service « fourre-tout ». |
| **D** : Inversion des dépendances | Les controllers dépendent des **interfaces** de service, pas des implémentations. Injection par **constructeur** uniquement (pas d'`@Autowired` sur champ). Les dépendances techniques sont injectées via leurs abstractions (`PasswordEncoder`, `AuthenticationManager`, repositories Spring Data). Aucun `new` sur une dépendance métier. |

### 5.1 Autres principes à respecter

- **DRY** : aucune duplication de logique (ex. la recherche d'une tâche par propriétaire est écrite une seule fois dans le service).
- **KISS** : pas d'abstraction sans besoin réel. Deux entités ne justifient ni générique de repository maison, ni pattern complexe.
- **YAGNI** : ne pas coder ce qui n'est pas demandé « au cas où ».

---

## 6. Structure du projet et conventions

### 6.1 Arborescence (`backend/`)

Le découpage par **couche** reflète explicitement l'architecture 3 tiers.

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/example/taskmanager/
│   │   │   ├── TaskManagerApplication.java
│   │   │   ├── config/          # SecurityConfig, CorsConfig, JpaAuditingConfig, JwtProperties
│   │   │   ├── security/        # JwtService, JwtAuthenticationFilter, CustomUserDetailsService,
│   │   │   │                    # RestAuthenticationEntryPoint, RestAccessDeniedHandler
│   │   │   ├── controller/      # AuthController, TaskController
│   │   │   ├── dto/             # RegisterRequest, LoginRequest, TaskRequest,
│   │   │   │                    # AuthResponse, UserResponse, TaskResponse, ErrorResponse
│   │   │   ├── exception/       # ResourceNotFoundException, EmailAlreadyUsedException,
│   │   │   │                    # GlobalExceptionHandler
│   │   │   ├── service/         # AuthService, TaskService (interfaces)
│   │   │   │   └── impl/        # AuthServiceImpl, TaskServiceImpl
│   │   │   ├── mapper/          # TaskMapper, UserMapper
│   │   │   ├── repository/      # UserRepository, TaskRepository
│   │   │   └── entity/          # User, Task, TaskStatus
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/example/taskmanager/   # tests unitaires et d'intégration
├── docker-compose.yml           # optionnel : MySQL en local
├── .env.example
├── .gitignore
├── pom.xml
└── README.md
```

> Le package de base (`com.example.taskmanager`) est à adapter (groupId réel du candidat).

### 6.2 Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Packages | minuscules, sans underscore | `com.example.taskmanager.service` |
| Classes | PascalCase | `TaskServiceImpl` |
| DTO de requête / réponse | suffixe `Request` / `Response` | `TaskRequest`, `TaskResponse` |
| Interface de service | nom métier sans préfixe `I` | `TaskService` |
| Implémentation | suffixe `Impl` | `TaskServiceImpl` |
| Repository | suffixe `Repository` | `TaskRepository` |
| Méthodes et variables | camelCase, verbes explicites | `findAllByUser`, `createTask` |
| Constantes | `UPPER_SNAKE_CASE` | `BEARER_PREFIX` |
| Endpoints | noms au pluriel, minuscules | `/api/tasks` |
| Tests | suffixe `Test` | `TaskServiceImplTest` |

### 6.3 Règles de code

- DTO en **Java records** (immuables) avec annotations Bean Validation.
- **Injection par constructeur** exclusivement.
- Pas de valeurs magiques : constantes ou propriétés de configuration.
- Le code est écrit en **anglais** (classes, méthodes). Les **messages d'erreur** renvoyés au client sont en **français**.
- Méthodes courtes, une seule responsabilité, nommage explicite plutôt que commentaires.
- Pas de code mort, pas de `System.out.println` (utiliser SLF4J).

---

## 7. Modèle de données

### 7.1 Entité `User` (table `users`)

| Champ | Type Java | Colonne | Contraintes |
|---|---|---|---|
| `id` | `Long` | `id` | PK, auto-incrément |
| `email` | `String` | `email` | Unique, non nul, max 255 |
| `password` | `String` | `password` | Non nul, haché BCrypt |

> La table s'appelle `users` (et non `user`) pour éviter un mot réservé.

### 7.2 Entité `Task` (table `tasks`)

| Champ | Type Java | Colonne | Contraintes |
|---|---|---|---|
| `id` | `Long` | `id` | PK, auto-incrément |
| `title` | `String` | `title` | Non nul, max 255 |
| `description` | `String` | `description` | Optionnel, max 1000 |
| `status` | `TaskStatus` | `status` | Non nul, `@Enumerated(EnumType.STRING)` |
| `createdAt` | `Instant` | `created_at` | Non nul, non modifiable, renseigné automatiquement |
| `updatedAt` | `Instant` | `updated_at` | Non nul, mis à jour automatiquement |
| `user` | `User` | `user_id` | FK non nulle, `@ManyToOne(fetch = LAZY)` |

### 7.3 Enum `TaskStatus`

`TODO`, `IN_PROGRESS`, `DONE`. Toujours persisté en `STRING`, **jamais** en `ORDINAL`.

### 7.4 Règles de persistance

- Les dates sont gérées par le **JPA Auditing** (`@CreatedDate`, `@LastModifiedDate` avec `@EnableJpaAuditing`), jamais renseignées manuellement dans les services.
- Un `User` possède plusieurs `Task`. La relation est **unidirectionnelle** depuis `Task` (pas de liste `tasks` dans `User`, inutile ici).
- Pas de `@Data` sur les entités. `equals`/`hashCode` non redéfinis ou basés sur l'identifiant uniquement.
- Génération du schéma : `spring.jpa.hibernate.ddl-auto=update` (suffisant pour ce test, limite documentée dans le README).
- `spring.jpa.open-in-view=false`.

### 7.5 Requêtes des repositories

| Repository | Méthode | Usage |
|---|---|---|
| `UserRepository` | `Optional<User> findByEmail(String email)` | Connexion, chargement de l'utilisateur courant |
| `UserRepository` | `boolean existsByEmail(String email)` | Contrôle d'unicité à l'inscription |
| `TaskRepository` | `List<Task> findAllByUserOrderByCreatedAtDesc(User user)` | Liste des tâches de l'utilisateur |
| `TaskRepository` | `Optional<Task> findByIdAndUser(Long id, User user)` | Lecture sécurisée pour modification et suppression |

---

## 8. Contrat d'API détaillé

Base : `/api`. Format : JSON (`Content-Type: application/json`). Dates en **ISO 8601 UTC** (ex. `2026-09-12T09:30:00Z`).

### 8.1 Vue d'ensemble

| Méthode | Endpoint | Auth | Succès | Erreurs possibles |
|---|---|---|---|---|
| POST | `/api/auth/register` | Non | 201 | 400, 409 |
| POST | `/api/auth/login` | Non | 200 | 400, 401 |
| GET | `/api/tasks` | Oui | 200 | 401 |
| POST | `/api/tasks` | Oui | 201 | 400, 401 |
| PUT | `/api/tasks/{id}` | Oui | 200 | 400, 401, 404 |
| DELETE | `/api/tasks/{id}` | Oui | 204 | 400, 401, 404 |

Les endpoints protégés exigent l'en-tête `Authorization: Bearer <token>`.

### 8.2 `POST /api/auth/register`

Requête :

```json
{ "email": "user@example.com", "password": "motdepasse123" }
```

Réponse `201 Created` :

```json
{ "id": 1, "email": "user@example.com" }
```

### 8.3 `POST /api/auth/login`

Requête :

```json
{ "email": "user@example.com", "password": "motdepasse123" }
```

Réponse `200 OK` :

```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

### 8.4 `GET /api/tasks`

Réponse `200 OK` : tableau de `TaskResponse` (tableau vide `[]` si aucune tâche, jamais 404).

```json
[
  {
    "id": 1,
    "title": "Préparer la réunion",
    "description": "Rassembler les documents",
    "status": "TODO",
    "createdAt": "2026-09-12T09:30:00Z",
    "updatedAt": "2026-09-15T14:10:00Z"
  }
]
```

### 8.5 `POST /api/tasks`

Requête :

```json
{ "title": "Préparer la réunion", "description": "Rassembler les documents", "status": "TODO" }
```

Réponse `201 Created` : la `TaskResponse` créée.

### 8.6 `PUT /api/tasks/{id}`

Requête : même corps que la création (remplacement de `title`, `description`, `status`).
Réponse `200 OK` : la `TaskResponse` mise à jour. `createdAt` et le propriétaire ne changent jamais.

### 8.7 `DELETE /api/tasks/{id}`

Réponse `204 No Content`, sans corps.

### 8.8 Règles de validation (Bean Validation sur les DTO)

| DTO | Champ | Règle | Message |
|---|---|---|---|
| `RegisterRequest` | `email` | `@NotBlank`, `@Email`, max 255 | « Email invalide » |
| `RegisterRequest` | `password` | `@NotBlank`, `@Size(min = 8, max = 72)` | « Le mot de passe doit contenir entre 8 et 72 caractères » |
| `LoginRequest` | `email`, `password` | `@NotBlank` | « Champ requis » |
| `TaskRequest` | `title` | `@NotBlank`, `@Size(max = 255)` | « Le titre est requis » |
| `TaskRequest` | `description` | `@Size(max = 1000)` | « La description est trop longue » |
| `TaskRequest` | `status` | `@NotNull` (valeur d'enum valide) | « Le statut est requis » |

> La limite de 72 sur le mot de passe vient de BCrypt (72 octets maximum).

---

## 9. Exigences fonctionnelles

| Réf. | Exigence |
|---|---|
| RB-01 | `POST /api/auth/register` crée un utilisateur. L'email est normalisé (trim + minuscules) et doit être unique (409 sinon). Données invalides : 400. |
| RB-02 | Le mot de passe est haché avec BCrypt avant enregistrement. Il n'apparaît dans aucune réponse ni aucun log. |
| RB-03 | `POST /api/auth/login` vérifie les identifiants et retourne un JWT. Identifiants invalides : 401 avec un message générique (sans préciser si c'est l'email ou le mot de passe). |
| RB-04 | Le JWT est signé (HS256), contient l'email (`sub`), la date d'émission et d'expiration. Durée de validité et clé secrète viennent de la configuration. |
| RB-05 | Tous les endpoints `/api/tasks/**` exigent un JWT valide. Absent, invalide ou expiré : 401 au format JSON. `/api/auth/**` est public. |
| RB-06 | `GET /api/tasks` retourne uniquement les tâches de l'utilisateur connecté, triées par date de création décroissante. |
| RB-07 | `POST /api/tasks` crée une tâche rattachée à l'utilisateur connecté. `createdAt` et `updatedAt` sont automatiques. |
| RB-08 | `PUT /api/tasks/{id}` remplace `title`, `description`, `status`. `updatedAt` est rafraîchi. Tâche inexistante ou appartenant à un autre utilisateur : 404. |
| RB-09 | `DELETE /api/tasks/{id}` supprime la tâche. Tâche inexistante ou appartenant à un autre utilisateur : 404. |
| RB-10 | Les entrées sont validées (section 8.8). Un `id` non numérique ou un statut inconnu renvoie 400. |
| RB-11 | Toutes les erreurs suivent le même format JSON (section 11). |
| RB-12 | CORS autorise l'origine du frontend (configurable) et les requêtes préalables (`OPTIONS`). |
| RB-13 | La configuration sensible (base de données, clé JWT, origines CORS) est externalisée. Aucun secret dans le dépôt. |
| RB-14 | Le client ne peut jamais définir `id`, `createdAt`, `updatedAt` ni le propriétaire : ces champs ne figurent pas dans les DTO de requête. |

> **Pourquoi 404 et pas 403 pour la tâche d'un autre utilisateur ?** Renvoyer 403 confirmerait l'existence de la ressource. Un 404 n'en dit rien.

---

## 10. Sécurité

### 10.1 Configuration Spring Security

- Configuration par **bean `SecurityFilterChain`** (pas de `WebSecurityConfigurerAdapter`, déprécié).
- Sessions **sans état** (`SessionCreationPolicy.STATELESS`).
- CSRF **désactivé** : justifié car l'API est sans état, sans cookie de session, et le jeton voyage dans l'en-tête `Authorization`. À mentionner dans le README.
- Règles d'accès : `/api/auth/**` en `permitAll`, toute autre requête `authenticated`.
- `PasswordEncoder` : bean `BCryptPasswordEncoder`.
- `AuthenticationManager` exposé en bean, utilisé par `AuthServiceImpl` pour la connexion.

### 10.2 Réponses 401 et 403 en JSON

Avec Spring Security 6, une requête anonyme sur une API sans état renvoie par défaut un **403** et non un 401. Le frontend s'appuie sur le 401 pour gérer l'expiration de session : il faut donc configurer :

- un `AuthenticationEntryPoint` personnalisé (`RestAuthenticationEntryPoint`) qui renvoie **401** au format `ErrorResponse` ;
- un `AccessDeniedHandler` personnalisé (`RestAccessDeniedHandler`) qui renvoie **403** au format `ErrorResponse`.

### 10.3 Filtre JWT

`JwtAuthenticationFilter` (étend `OncePerRequestFilter`), placé avant `UsernamePasswordAuthenticationFilter` :

1. lit l'en-tête `Authorization` et vérifie le préfixe `Bearer ` ;
2. valide la signature et l'expiration via `JwtService` ;
3. charge l'utilisateur (`CustomUserDetailsService`) et renseigne le `SecurityContext` ;
4. en cas de jeton invalide ou expiré : **n'authentifie pas** et laisse la chaîne continuer (l'entry point renverra le 401). Le filtre ne lève pas d'exception non gérée.

### 10.4 JWT

| Point | Règle |
|---|---|
| Bibliothèque | `jjwt` |
| Algorithme | HS256 |
| Claims | `sub` (email), `iat`, `exp` |
| Durée de validité | Configurable (`jwt.expiration-ms`), 24 h par défaut |
| Clé secrète | Fournie par variable d'environnement, 32 caractères minimum, jamais en dur ni committée |
| Refresh token | **Non** (hors périmètre) |
| Déconnexion | Gérée côté client (suppression du token). Pas d'endpoint backend. |

### 10.5 Identification de l'utilisateur courant

Le controller récupère l'identité via `Authentication` / `Principal` (l'email issu du token) et la **transmet au service** en paramètre. Le service ne lit pas lui-même le `SecurityContext` : il reste ainsi indépendant de la couche web et facile à tester.

### 10.6 CORS

- Bean `CorsConfigurationSource`, activé dans la chaîne de sécurité (`.cors(...)`), afin que les requêtes `OPTIONS` ne soient pas bloquées.
- Origines autorisées : propriété `app.cors.allowed-origins` (défaut `http://localhost:5173`).
- Méthodes : `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- En-têtes : `Authorization`, `Content-Type`.
- Pas de `allowCredentials` (pas de cookies). **Jamais** de `*` en production.

---

## 11. Gestion des erreurs

### 11.1 Format unique

```json
{
  "timestamp": "2026-09-15T14:10:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Données invalides",
  "path": "/api/tasks",
  "fieldErrors": { "title": "Le titre est requis" }
}
```

`fieldErrors` n'est présent que pour les erreurs de validation (`@JsonInclude(NON_NULL)`).

### 11.2 Correspondance exception → réponse

Centralisée dans **un seul** `@RestControllerAdvice` (`GlobalExceptionHandler`).

| Exception | Code | Message |
|---|---|---|
| `MethodArgumentNotValidException` | 400 | « Données invalides » + `fieldErrors` |
| `HttpMessageNotReadableException` (JSON malformé, statut inconnu) | 400 | « Requête invalide » |
| `MethodArgumentTypeMismatchException` (`id` non numérique) | 400 | « Paramètre invalide » |
| `BadCredentialsException` | 401 | « Email ou mot de passe incorrect » |
| `ResourceNotFoundException` | 404 | « Tâche introuvable » |
| `EmailAlreadyUsedException` | 409 | « Cet email est déjà utilisé » |
| `DataIntegrityViolationException` (doublon d'email concurrent) | 409 | « Cet email est déjà utilisé » |
| `Exception` (repli) | 500 | « Erreur interne du serveur » |

### 11.3 Règles

- Aucune **stack trace** ni détail technique dans les réponses. Elles sont journalisées côté serveur.
- Les 401 et 403 produits par la chaîne de sécurité utilisent le même format (section 10.2).
- Les exceptions métier héritent d'une classe de base commune.
- Le code 403 reste théoriquement possible via le handler de sécurité, mais aucune règle métier ne le déclenche.

---

## 12. Configuration et environnement

### 12.1 Variables d'environnement

| Variable | Rôle | Exemple |
|---|---|---|
| `DB_URL` | URL JDBC de MySQL | `jdbc:mysql://localhost:3306/taskmanager` |
| `DB_USERNAME` | Utilisateur MySQL | `taskuser` |
| `DB_PASSWORD` | Mot de passe MySQL | *(à définir)* |
| `JWT_SECRET` | Clé de signature JWT | *(32 caractères minimum)* |
| `JWT_EXPIRATION_MS` | Durée du token | `86400000` |
| `CORS_ALLOWED_ORIGINS` | Origines autorisées | `http://localhost:5173` |

### 12.2 `application.properties` (principes)

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false
jwt.secret=${JWT_SECRET}
jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

- `JWT_SECRET` n'a **pas de valeur par défaut** : l'application refuse de démarrer si elle est absente, ce qui évite un secret faible par oubli.
- Un fichier `.env.example` (valeurs factices) est fourni. Le vrai `.env` est dans `.gitignore`.
- Regrouper les propriétés JWT dans une classe `JwtProperties` (`@ConfigurationProperties`).

### 12.3 Docker Compose (optionnel)

Un `docker-compose.yml` lance **uniquement MySQL** pour le développement local :

```yaml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: taskmanager
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

> Le `Dockerfile` du backend (build multi-étapes, exécution du JAR) relève du **module CI/CD bonus** et n'est pas développé à ce stade. La configuration externalisée le rend simple à ajouter ensuite.
>
> Une fois le module CI/CD réalisé, un `docker-compose.yml` unique à la **racine du dépôt** (MySQL + backend + frontend) remplace ce fichier. On peut alors ne lancer que la base avec `docker compose up -d mysql`.

---

## 13. Tests

Ciblés, pertinents, pas d'objectif de couverture chiffré. Ils démontrent la qualité de l'architecture et alimentent l'étape « build et test » du CI/CD bonus.

| Niveau | Outils | Ce qu'on vérifie |
|---|---|---|
| Unitaire (service) | JUnit 5 + Mockito | `AuthServiceImpl` : email déjà utilisé, mot de passe haché. `TaskServiceImpl` : isolation par utilisateur, 404 si tâche d'un autre utilisateur. |
| Web / intégration | `@SpringBootTest` + MockMvc + `spring-security-test` + H2 | Sécurité (401 sans token), parcours inscription → connexion → CRUD, format des erreurs, validation. |

Règles :

- Un test = un comportement, nommé clairement.
- Les tests d'intégration utilisent un profil `test` avec H2 en mémoire (aucune dépendance à MySQL pour lancer `mvn test`).
- Les tests ne dépendent pas de l'ordre d'exécution.

---

## 14. Bonnes pratiques transverses

| Domaine | Règle |
|---|---|
| Journalisation | SLF4J. Jamais de mot de passe, de token ni de clé dans les logs. Niveaux cohérents (`info` pour les événements, `error` pour les échecs inattendus). |
| Transactions | `@Transactional` sur les méthodes de service. `readOnly = true` pour les lectures. |
| Immutabilité | DTO en records. Pas de setters inutiles sur les entités. |
| Null-safety | `Optional` uniquement en retour de repository et jamais en paramètre. Pas de `null` retourné à la place d'une liste. |
| Mapping | Mappers dédiés (manuels), aucune conversion inline dans les controllers. |
| Git | Commits atomiques et clairs (Conventional Commits recommandé : `feat:`, `fix:`, `test:`, `docs:`). `.gitignore` : `target/`, `.env`, fichiers d'IDE. |
| Lisibilité | Méthodes courtes, noms explicites, pas de commentaire qui répète le code. |
| Dépendances | Versions gérées par le parent Spring Boot. Pas de dépendance inutilisée. |

---

## 15. Garde-fous : ce qu'il ne faut pas faire

### 15.1 Fonctionnalités hors cadre

| Interdit | Raison |
|---|---|
| Rôles, permissions (ADMIN/USER) | Un seul type d'utilisateur dans le sujet |
| Refresh token, endpoint `/logout`, liste noire de tokens | Non demandé. La déconnexion est côté client. |
| `GET /api/tasks/{id}` | Non listé. Le frontend n'en a pas besoin. |
| Pagination, tri et filtres serveur (`?status=`, `?q=`) | Le filtrage et la recherche sont faits côté client (frontend). |
| Endpoints `/api/users/**` (profil, liste, suppression de compte) | Non demandé |
| Mot de passe oublié, vérification d'email, changement de mot de passe | Non demandé |
| Suppression logique (soft delete), historique, audit avancé | Non demandé |
| Catégories, tags, échéances, priorités, pièces jointes, partage de tâches | Le modèle `Task` est fixé par le sujet |
| WebSocket, SSE, notifications | La « synchronisation » se fait via l'API partagée |
| Documentation Swagger / OpenAPI | Le README suffit |
| Cache, rate limiting, i18n | Hors sujet |
| Migrations Flyway / Liquibase | Non exigé pour ce test |

### 15.2 Pratiques interdites

| Interdit | Alternative |
|---|---|
| Exposer une entité JPA dans un controller | Utiliser un DTO |
| Logique métier dans un controller | La placer dans le service |
| Appeler un repository depuis un controller | Passer par le service |
| Stocker un mot de passe en clair | BCrypt |
| Secret ou identifiant en dur dans le code ou le dépôt | Variables d'environnement |
| Injection par champ (`@Autowired` sur attribut) | Injection par constructeur |
| `@Data` sur une entité JPA | Getters/setters ciblés |
| `EnumType.ORDINAL` | `EnumType.STRING` |
| Origine CORS `*` avec authentification | Origines explicites configurables |
| Renvoyer une stack trace au client | Message générique + log serveur |
| `catch (Exception e)` silencieux | Gestion centralisée dans le `@RestControllerAdvice` |
| Un service « fourre-tout » (`AppService`) | `AuthService` et `TaskService` séparés |
| Ajouter une dépendance « au cas où » | Uniquement si exigée par le sujet |

### 15.3 Signaux d'alerte (dérive de périmètre)

Si l'un de ces cas se présente, s'arrêter et revenir au sujet :

- une nouvelle table apparaît en dehors de `users` et `tasks` ;
- un nouvel endpoint n'apparaît pas dans le tableau du § 8.1 ;
- une nouvelle dépendance n'est pas dans le § 3.2 ;
- un controller importe un repository ;
- une entité apparaît dans une signature de controller ;
- un champ est ajouté à `Task` ou `User` sans être dans le sujet.

---

## 16. Plan de réalisation

Chaque étape produit un résultat vérifiable avant de passer à la suivante.

| Étape | Contenu | Résultat vérifiable |
|---|---|---|
| 1 | Initialisation Maven, dépendances, `application.properties`, MySQL local (Docker Compose optionnel) | L'application démarre et se connecte à MySQL |
| 2 | Entités `User`, `Task`, `TaskStatus`, repositories, JPA Auditing | Les tables sont créées, les dates se remplissent |
| 3 | DTO, mappers, `GlobalExceptionHandler`, `ErrorResponse` | Format d'erreur unique en place |
| 4 | Sécurité : `JwtService`, filtre, `SecurityConfig`, entry point 401, CORS | Un endpoint protégé renvoie 401 sans token |
| 5 | `AuthService` et `AuthController` (register, login) | Inscription et connexion fonctionnent, un JWT est renvoyé |
| 6 | `TaskService` et `TaskController` (CRUD) | CRUD complet, isolation par utilisateur |
| 7 | Tests unitaires et d'intégration | `./mvnw test` passe sans MySQL |
| 8 | README backend, `.env.example`, relecture avec la checklist de conformité | Le projet se lance avec les seules instructions du README |

---

## 17. Checklist de conformité

À relire avant chaque livraison ou revue de code.

### 17.1 Architecture 3 tiers

- [ ] Les controllers ne contiennent aucune logique métier.
- [ ] Aucun controller n'importe un repository.
- [ ] Les services ne dépendent d'aucune classe HTTP.
- [ ] Aucune entité JPA n'est exposée par l'API.
- [ ] Le flux de dépendance est Présentation → Métier → Données.

### 17.2 SOLID

- [ ] Chaque classe n'a qu'une responsabilité.
- [ ] `AuthService` et `TaskService` sont deux interfaces distinctes et courtes.
- [ ] Les controllers dépendent des interfaces de service.
- [ ] Injection par constructeur partout.
- [ ] Ajouter un type d'erreur ne modifie pas le code existant.

### 17.3 Périmètre

- [ ] Seuls les 6 endpoints du sujet existent.
- [ ] Seules les entités `User` et `Task` existent.
- [ ] Aucune dépendance hors liste autorisée.
- [ ] Aucune fonctionnalité de la liste « hors cadre ».

### 17.4 Sécurité et qualité

- [ ] Mots de passe hachés, jamais renvoyés ni journalisés.
- [ ] Aucun secret dans le dépôt.
- [ ] 401 en JSON pour les requêtes non authentifiées.
- [ ] Un utilisateur ne peut jamais accéder aux tâches d'un autre.
- [ ] Format d'erreur identique partout, sans stack trace.

---

## 18. Critères d'acceptation

### 18.1 Matrice de scénarios

| # | Scénario | Résultat attendu |
|---|---|---|
| 1 | Inscription avec email et mot de passe valides | 201 + `{id, email}` |
| 2 | Inscription avec un email déjà utilisé | 409 |
| 3 | Inscription avec un email invalide ou un mot de passe trop court | 400 + `fieldErrors` |
| 4 | Connexion avec identifiants corrects | 200 + `{token}` |
| 5 | Connexion avec un mauvais mot de passe | 401 |
| 6 | `GET /api/tasks` sans token | 401 (JSON) |
| 7 | `GET /api/tasks` avec un token invalide ou expiré | 401 (JSON) |
| 8 | `GET /api/tasks` avec un token valide, sans tâche | 200 + `[]` |
| 9 | `GET /api/tasks` : deux utilisateurs ayant chacun des tâches | Chacun ne voit que les siennes |
| 10 | `POST /api/tasks` valide | 201 + tâche avec `createdAt` et `updatedAt` renseignés |
| 11 | `POST /api/tasks` sans titre | 400 + `fieldErrors.title` |
| 12 | `POST /api/tasks` avec un statut inconnu | 400 |
| 13 | `PUT /api/tasks/{id}` sur sa propre tâche | 200, `updatedAt` modifié, `createdAt` inchangé |
| 14 | `PUT /api/tasks/{id}` sur la tâche d'un autre utilisateur | 404 |
| 15 | `PUT /api/tasks/{id}` sur un id inexistant | 404 |
| 16 | `DELETE /api/tasks/{id}` sur sa propre tâche | 204 |
| 17 | `DELETE /api/tasks/{id}` sur la tâche d'un autre utilisateur | 404 |
| 18 | `id` non numérique dans l'URL | 400 |
| 19 | Requête `OPTIONS` depuis `http://localhost:5173` | Réponse CORS valide, non bloquée |
| 20 | Aucune réponse n'expose le mot de passe ou une stack trace | Vérifié |

### 18.2 Critères globaux

- [ ] Les 6 endpoints du sujet fonctionnent conformément au contrat.
- [ ] L'authentification JWT est en place avec Spring Security.
- [ ] Les données sont persistées dans MySQL via Spring Data JPA.
- [ ] L'architecture 3 tiers et les principes SOLID sont respectés (checklist § 17).
- [ ] Aucune fonctionnalité hors périmètre n'a été ajoutée.
- [ ] `./mvnw test` réussit.
- [ ] Le projet se lance avec les seules instructions du README.

---

## 19. Livrables

- Code source dans le dossier `backend/` du dépôt GitHub public.
- `README.md` du backend contenant :
  - les prérequis (JDK, Docker pour MySQL) ;
  - les variables d'environnement (renvoi vers `.env.example`) ;
  - les commandes : lancer MySQL (`docker compose up -d`), lancer l'API (`./mvnw spring-boot:run`), lancer les tests (`./mvnw test`) ;
  - le tableau des endpoints avec des exemples `curl` ;
  - la description technique : architecture 3 tiers, principes SOLID appliqués, choix du JWT sans état, CSRF désactivé et pourquoi, `ddl-auto=update` et sa limite ;
  - la version de Spring Boot et de Java utilisées.
- Fichier `.env.example`.
- `docker-compose.yml` *(optionnel)*.

**Bonus, à traiter plus tard :** `Dockerfile` du backend et étapes de build et test dans le pipeline CI/CD.

---

## 20. Hypothèses à valider

Le sujet ne précise pas ces points. Elles sont alignées sur le cahier des charges du frontend.

1. **Valeurs de `status`** : `TODO`, `IN_PROGRESS`, `DONE`.
2. **Champs d'inscription** : email et mot de passe (un champ `name` s'ajouterait uniquement si le frontend le demande).
3. **Réponse de connexion** : `{ "token": "..." }`.
4. **Réponse d'inscription** : `201` avec `{ id, email }`.
5. **Mot de passe** : minimum 8 caractères, maximum 72.
6. **Format des dates** : ISO 8601 en UTC (`Instant`), par exemple `2026-09-12T09:30:00Z`.
7. **Ordre de la liste** : par date de création décroissante (le sujet n'impose aucun tri).
8. **Durée du JWT** : 24 h, configurable.
9. **Tâche d'un autre utilisateur** : 404 (et non 403).
10. **Statut obligatoire** à la création et à la modification : le frontend l'envoie toujours.
11. **CORS** : origine `http://localhost:5173` en développement, configurable ensuite.
12. **Schéma de base** : généré par Hibernate (`ddl-auto=update`), sans outil de migration.
