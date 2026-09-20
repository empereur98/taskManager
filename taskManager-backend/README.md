# Task Manager Backend

API RESTful pour la gestion de tâches avec authentification JWT.

## Prérequis

- JDK 21
- Maven (inclus via wrapper `mvnw`)
- MySQL 8.x (ou Docker pour le développement local)

## Configuration

1. Copier le fichier `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

2. Configurer les variables d'environnement dans `.env` :
   - `DB_URL` : URL de connexion MySQL
   - `DB_USERNAME` : Utilisateur MySQL
   - `DB_PASSWORD` : Mot de passe MySQL
   - `JWT_SECRET` : Clé secrète pour la signature JWT (minimum 32 caractères)
   - `JWT_EXPIRATION_MS` : Durée de validité du token en millisecondes (défaut : 86400000 = 24h)
   - `CORS_ALLOWED_ORIGINS` : Origines autorisées pour CORS (défaut : http://localhost:5173)

## Lancer MySQL (optionnel, avec Docker Compose)

```bash
docker compose up -d mysql
```

## Lancer l'application

```bash
./mvnw spring-boot:run
```

## Lancer les tests

```bash
./mvnw test
```

## Endpoints

### Authentification

#### Inscription
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"motdepasse123"}'
```
Réponse : `201 Created` avec `{ "id": 1, "email": "user@example.com" }`

#### Connexion
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"motdepasse123"}'
```
Réponse : `200 OK` avec `{ "token": "eyJhbGciOiJIUzI1NiJ9..." }`

### Tâches

Tous les endpoints suivants nécessitent l'en-tête `Authorization: Bearer <token>`.

#### Lister les tâches
```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <token>"
```
Réponse : `200 OK` avec tableau de tâches

#### Créer une tâche
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Préparer la réunion","description":"Rassembler les documents","status":"TODO"}'
```
Réponse : `201 Created` avec la tâche créée

#### Modifier une tâche
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Préparer la réunion","description":"Documents rassemblés","status":"IN_PROGRESS"}'
```
Réponse : `200 OK` avec la tâche modifiée

#### Supprimer une tâche
```bash
curl -X DELETE http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```
Réponse : `204 No Content`

## Architecture

### 3 Tiers

- **Présentation** : `controller/`, `dto/`, `exception/` - Gestion HTTP, validation, mapping
- **Métier** : `service/` - Règles de gestion, transactions
- **Données** : `repository/`, `entity/` - Persistance via JPA

### Principes SOLID appliqués

- **S** : Chaque classe a une responsabilité unique (controllers, services, mappers, filtres séparés)
- **O** : Ajout de nouveaux types d'erreurs sans modifier le code existant (via `@ExceptionHandler`)
- **L** : Les exceptions métier héritent d'une base commune
- **I** : Interfaces courtes et ciblées (`AuthService`, `TaskService`)
- **D** : Injection par constructeur, dépendance sur les interfaces de service

### Sécurité

- JWT sans état (stateless) avec Spring Security
- CSRF désactivé (API sans cookie de session)
- BCrypt pour le hachage des mots de passe
- CORS configuré pour le frontend
- Isolation des données par utilisateur (chaque utilisateur ne voit que ses tâches)

### Stack technique

- Java 21
- Spring Boot 4.1.1
- Spring Data JPA (Hibernate)
- MySQL 8.x
- Spring Security + JWT (jjwt 0.12.6)
- Maven

### Notes

- Le schéma de base est généré automatiquement par Hibernate (`ddl-auto=update`)
- Cette approche est suffisante pour ce projet de test
- Pour un environnement de production, utiliser un outil de migration (Flyway/Liquibase)
