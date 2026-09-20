# TaskManager — Monorepo

Application de gestion de tâches : API REST Spring Boot (`backend/`), client React/Vite
(`frontend/`) et application mobile Flutter *(bonus)* (`mobile/`), avec pipeline CI/CD GitHub
Actions (`.github/workflows/`) déployant backend et frontend sur Google Cloud Run.

## Structure du dépôt

```
task-manager/
├── .github/
│   ├── workflows/          # CI/CD (voir README-CICD.md)
│   └── dependabot.yml
├── backend/                 # API Spring Boot (Java 21)
├── frontend/                # Client React + Vite + TypeScript
├── mobile/                  # Application Flutter (bonus)
├── docker-compose.yml        # Exécution locale complète (MySQL + backend + frontend)
└── README-CICD.md            # Documentation détaillée du pipeline CI/CD
```

## Démarrage local

### Backend + Frontend — via Docker Compose (recommandé, reproduit l'environnement de la CI)

```bash
cp backend/.env.example backend/.env   # puis renseigner les valeurs
cp frontend/.env.example frontend/.env
docker compose up --build
```

- Backend : http://localhost:8080
- Frontend : http://localhost:5173

### Backend + Frontend — en local, sans Docker

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

### Mobile (Flutter)

```bash
cd mobile
flutter pub get
# Emulateur Android : 10.0.2.2 pointe vers le localhost de la machine hote
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

## CI/CD

Voir [`README-CICD.md`](./README-CICD.md) pour :
- la correspondance entre le pipeline et les chapitres du support DevOps,
- la liste des secrets/variables GitHub à configurer,
- les étapes de mise en route du déploiement Cloud Run et de la distribution de l'APK mobile.

## Documentation technique

- [`backend/README.md`](./backend/README.md) et [`backend/cahier_des_charges_backend_task_manager.md`](./backend/cahier_des_charges_backend_task_manager.md)
- [`frontend/README.md`](./frontend/README.md) et [`frontend/BACKEND_SPECIFICATION.md`](./frontend/BACKEND_SPECIFICATION.md)
- [`mobile/README.md`](./mobile/README.md)
