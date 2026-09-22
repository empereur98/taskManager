# TaskManager — Monorepo

Application de gestion de tâches : API REST Spring Boot (`taskManager-backend/`), client React/Vite
(`taskManager-frontend/`) et application mobile Flutter *(bonus)* (`taskManager-mobile/`), avec pipeline CI/CD GitHub
Actions (`.github/workflows/`) déployant le backend sur Render, le frontend sur Vercel et l'APK mobile sur GitHub Releases.

## 🌐 Démo en ligne & Téléchargement (Accès public)

- 💻 **Application Web (Frontend React)** : 👉 **[https://task-manager-self-pi-69.vercel.app/](https://task-manager-self-pi-69.vercel.app/)**
- 📱 **Application Mobile Android (APK)** : 👉 **[Télécharger l'APK sur GitHub Releases](https://github.com/empereur98/taskManager/releases)**
  *(L'APK release est généré et signé automatiquement à chaque livraison sur `main` par le pipeline CD - Mobile).*

---

## Structure du dépôt

```
task-manager/
├── .github/
│   ├── workflows/               # CI/CD (voir README-CICD.md)
│   └── dependabot.yml
├── taskManager-backend/          # API Spring Boot (Java 21) - Déployée sur Render
├── taskManager-frontend/         # Client React + Vite + TypeScript - Déployé sur Vercel
├── taskManager-mobile/           # Application Flutter (bonus) - APK via GitHub Releases
├── docker-compose.yml            # Exécution locale complète (MySQL + backend + frontend)
└── README-CICD.md                # Documentation détaillée du pipeline CI/CD
```

## Démarrage local

### Backend + Frontend — via Docker Compose (recommandé, reproduit l'environnement de la CI)

```bash
cp taskManager-backend/.env.example taskManager-backend/.env   # puis renseigner les valeurs
cp taskManager-frontend/.env.example taskManager-frontend/.env
docker compose up --build
```

- Backend : http://localhost:8080
- Frontend : http://localhost:5173

### Backend + Frontend — en local, sans Docker

```bash
# Backend
cd taskManager-backend
./mvnw spring-boot:run

# Frontend (dans un autre terminal)
cd taskManager-frontend
npm install
npm run dev
```

### Mobile (Flutter)

```bash
cd taskManager-mobile
flutter pub get
# Emulateur Android : 10.0.2.2 pointe vers le localhost de la machine hote
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

## CI/CD

Voir [`README-CICD.md`](./README-CICD.md) pour :
- la correspondance entre le pipeline et les chapitres du support DevOps,
- la liste des secrets/variables GitHub à configurer (Aiven, Render, Vercel),
- les étapes de mise en route du déploiement continu et de la distribution de l'APK mobile.

## Documentation technique

- [`taskManager-backend/README.md`](./taskManager-backend/README.md) et [`taskManager-backend/cahier_des_charges_backend_task_manager.md`](./taskManager-backend/cahier_des_charges_backend_task_manager.md)
- [`taskManager-frontend/README.md`](./taskManager-frontend/README.md) et [`taskManager-frontend/BACKEND_SPECIFICATION.md`](./taskManager-frontend/BACKEND_SPECIFICATION.md)
- [`taskManager-mobile/README.md`](./taskManager-mobile/README.md)
