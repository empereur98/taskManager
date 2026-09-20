# CI/CD TaskManager — Guide d'installation

Ce dossier est le **monorepo complet, assemblé et prêt à pousser** du projet **TaskManager**
(backend Spring Boot, frontend React, mobile Flutter en bonus), avec un pipeline CI/CD construit en
respectant la structure du support *Module 7 — DevSecOps & CI/CD avec GitHub* (chapitres 2, 3 et 4),
et adapté au monorepo exigé par le cahier des charges (`task-manager/backend/`,
`task-manager/frontend/`, `task-manager/mobile/`, `.github/workflows/`).

## 1. Ce qui a été ajouté ou modifié par rapport à vos projets d'origine

Tout le reste (contrôleurs, composants React, écrans Flutter, etc.) est votre code tel quel — seuls
ces fichiers sont nouveaux ou patchés :

```
task-manager/
├── .github/
│   ├── workflows/
│   │   ├── backend-ci.yml
│   │   ├── backend-cd.yml
│   │   ├── frontend-ci.yml
│   │   ├── frontend-cd.yml
│   │   ├── mobile-ci.yml
│   │   ├── mobile-cd.yml
│   │   └── codeql-scheduled.yml
│   └── dependabot.yml
├── backend/
│   ├── pom.xml                # modifié : + JaCoCo, + Actuator
│   ├── Dockerfile             # nouveau : multi-stage, utilisateur non-root
│   └── src/
│       ├── main/java/.../config/SecurityConfig.java   # modifié : autorise /actuator/health
│       └── main/resources/application.properties       # modifié : secrets externalisés
├── frontend/
│   ├── package.json           # modifié : + scripts lint/test/test:coverage
│   ├── vitest.config.ts       # nouveau
│   ├── eslint.config.js       # nouveau
│   ├── Dockerfile             # modifié : ARG VITE_API_URL, HEALTHCHECK
│   ├── nginx.conf             # modifié : + endpoint /health
│   └── src/lib/utils.test.ts  # nouveau : premier test reel
└── mobile/                    # inchangé : tests et lint deja en place a l'upload
    ├── pubspec.yaml
    ├── analysis_options.yaml
    ├── lib/
    └── test/
```

Ce dossier est déjà l'arborescence complète : dézippez-le et poussez-le tel quel comme dépôt Git
(voir section 5).

## 2. Pourquoi un monorepo et trois pipelines distincts

Le cahier des charges (section 12) impose un dépôt unique avec `backend/`, `frontend/` et
`mobile/` côte à côte. Contrairement à l'exemple TaskFlow du support (un seul projet Java), il y a
ici **trois applications indépendantes** : les pipelines sont donc dupliqués (un couple CI/(C)D par
application) mais chacun ne se déclenche que si son propre dossier a changé, grâce au filtre
`paths` :

```yaml
on:
  push:
    paths:
      - 'backend/**'   # ou 'frontend/**'
```

Cela évite de reconstruire et redéployer le frontend quand seul le backend a changé, et
inversement — un principe de bon sens qui n'apparaît pas dans le support (projet unique) mais qui
en découle directement.

## 3. Correspondance avec les chapitres du support

| Chapitre du support | Ce qui a été repris tel quel | Ce qui a été adapté et pourquoi |
|---|---|---|
| **Module 1** (Git/GitHub) | Convention de branches `main` / `feature/xxx`, PR obligatoire | `.gitignore` déjà correct dans vos deux projets (`.env` ignoré) ; le secret `jwt.secret` codé en dur dans `application.properties` a été externalisé (`${JWT_SECRET:...}`), à l'image de la mise en garde du Module 1 sur les secrets committés |
| **Module 2** (CI : build, tests, qualité) | Ordre `checkout → setup → build → tests → quality gate`, cache des dépendances, upload d'artefacts, JaCoCo comme Quality Gate | **Backend** : pas de séparation Surefire(`*Test`)/Failsafe(`*IT`) car vos tests d'intégration (`@SpringBootTest`, `@WebMvcTest`) tournent sur H2 en mémoire sans Testcontainers — ils s'exécutent donc tous dans le même `mvn test`, en un seul job. **Frontend** (absent du support, qui ne couvre que du Java) : équivalent construit avec `npm ci` → `eslint` → `tsc + vite build` → `vitest --coverage`, le seuil de couverture Vitest jouant le rôle du seuil JaCoCo |
| **Module 3** (DevSecOps) | Gitleaks en tête de pipeline (bloquant), CodeQL en mode PR (léger) + planifié (complet, `codeql-scheduled.yml`), Trivy sur l'image Docker (bloquant sur HIGH/CRITICAL), Dependabot | Ajout de `npm audit` côté frontend (équivalent SCA natif à Dependabot, absent de l'écosystème Maven du support) ; CodeQL utilise `javascript-typescript` au lieu de `java` pour le frontend |
| **Module 4** (Packaging & CD) | Dockerfile multi-stage, tags `sha-<commit>` + `latest` sur GHCR, déclenchement du CD via `workflow_run` conditionné au succès de la CI, smoke test post-déploiement, job `notify-failure` | **Déploiement web** : le support utilise Render pour sa simplicité pédagogique ; votre cahier des charges (section 10, RD-05) exige explicitement **GCP Cloud Run** — le CD utilise donc `google-github-actions/deploy-cloudrun` avec authentification par clé de service (`GCP_SA_KEY`), documentée dans le support comme l'option "AWS" plus proche d'un contexte d'entreprise. **Mobile** : il n'y a pas de "Continuous *Deployment*" (pas de compte Play Store dans le cadre de l'exercice) — le pipeline s'arrête à la **Continuous *Delivery*** définie en Module 4 : l'APK release est produit automatiquement et publié comme artefact GitHub Actions + GitHub Release, prêt à être installé manuellement pour test |

### Cas particulier : le module mobile (absent du support, ajouté par cohérence)

Le support ne couvre que des projets Java/web ; il ne dit donc rien sur Flutter. Les choix suivants
transposent néanmoins fidèlement sa logique :

| Concept du support | Équivalent mobile retenu |
|---|---|
| Build (`mvn compile`) | `flutter pub get` |
| Tests unitaires (JUnit/Vitest) | `flutter test` (tests déjà présents dans `mobile/test/`) |
| JaCoCo / Vitest coverage (Quality Gate) | `flutter test --coverage` + `lcov.info` vérifié par `VeryGoodOpenSource/very_good_coverage` (seuil 40 %) |
| SAST (CodeQL) | **Non disponible** : CodeQL ne supporte pas Dart. Remplacé par `flutter analyze --fatal-infos`, qui applique les règles strictes déjà définies dans `mobile/analysis_options.yaml` (traité comme bloquant, au même titre que le Quality Gate) |
| SCA (Dependabot + Trivy/npm audit) | Dependabot sur l'écosystème `pub` + `trivy` en mode `fs` (scan de `pubspec.lock`, non bloquant : base CVE Dart moins mature que Maven/npm, cf. logique "warning vs bloquant" du Module 3) |
| Container scan (Trivy sur l'image) | Sans objet : le mobile ne produit pas d'image Docker |
| CD → GHCR + Cloud Run | CD → artefact APK signé (clé debug par défaut), publié en artifact + GitHub Release |

## 4. Secrets et variables à configurer sur GitHub

`Settings → Secrets and variables → Actions`, sur l'environnement `test` (recommandé, cf. Module 4
"Gestion des secrets" — évite de mettre des secrets de déploiement au niveau du dépôt entier) :

**Secrets (chiffrés) :**
| Nom | Usage |
|---|---|
| `GCP_SA_KEY` | Clé JSON du compte de service GCP (droits Cloud Run Admin + Service Account User) |
| `GCP_PROJECT_ID` | ID du projet GCP |
| `GCP_REGION` | Région Cloud Run (ex. `europe-west1`) |
| `JWT_SECRET` | Secret JWT (32 caractères minimum), jamais commité |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Connexion à la base de données de l'environnement de test |
| `CORS_ALLOWED_ORIGINS` | URL(s) du frontend déployé |
| `WEBHOOK_URL` *(optionnel)* | Notification Slack/Discord en cas d'échec de déploiement |

**Variables (non sensibles, `vars.*`) :**
| Nom | Usage |
|---|---|
| `VITE_API_URL_TEST` | URL du backend déployé, injectée au build de l'image frontend |
| `API_BASE_URL_TEST` | URL du backend déployé, injectée au build de l'APK mobile (`--dart-define`) |

**Optionnel (signature Play Store, non requis pour ce pipeline) :**
| Nom | Usage |
|---|---|
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | À ajouter si vous voulez signer l'APK avec une vraie clé de production plutôt que la clé de debug Flutter par défaut |

`GITHUB_TOKEN` est fourni automatiquement par GitHub Actions (utilisé pour Gitleaks, CodeQL et la
publication sur GHCR) — ne pas le recréer manuellement.

## 5. Étapes de mise en route

1. Créer un compte de service GCP dédié au déploiement (`taskmanager-deployer@<project>.iam.gserviceaccount.com`),
   lui attribuer les rôles `roles/run.admin` et `roles/iam.serviceAccountUser`, générer une clé JSON.
2. Renseigner les secrets et variables ci-dessus dans GitHub (idéalement sur un *environment* nommé
   `test` avec règle de protection si vous voulez une validation manuelle avant déploiement).
3. Copier les fichiers de ce dossier dans votre dépôt (section 1).
4. Committer sur une branche `feature/cicd-pipeline`, ouvrir une pull request : les jobs
   `secret-scan`, `build-and-test`, `sast`, `sca` (frontend), `container-scan` (backend/frontend),
   `dependency-scan` (mobile) doivent tous passer avant fusion.
5. Dans `Settings → Branches`, protéger `main` en exigeant ces checks (Module 1 et 2 : "une CI qui
   n'empêche pas la fusion n'a aucune valeur").
6. Fusionner : `CD - Backend` et `CD - Frontend` se déclenchent automatiquement après succès de
   leur CI respective, publient les images sur GHCR et déploient sur Cloud Run.
7. Ajuster progressivement les seuils de couverture (`jacoco-check` à 50 % dans `pom.xml`,
   `thresholds` à 40 % dans `vitest.config.ts`) au fur et à mesure que la suite de tests s'étoffe —
   ce sont des points de départ volontairement modestes, pas des objectifs finaux (cf. Module 2,
   "Stratégie réaliste").

## 6. Limites connues / pistes d'amélioration (cf. Module 4 "Comment améliorer encore cette pipeline")

- Les actions tierces (`actions/checkout@v4`, etc.) sont épinglées par tag et non par SHA de commit :
  à durcir avant un usage en production réelle.
- L'authentification GCP utilise une clé de service statique ; passer à la *Workload Identity
  Federation* (sans clé stockée) est recommandé à terme.
- L'APK mobile est signé avec la clé de debug Flutter par défaut (pas de keystore de production
  configuré) : suffisant pour une installation de test manuelle, à ne pas publier tel quel sur le
  Play Store.
- Aucun test End-to-End (Playwright/Cypress côté frontend, RestAssured côté backend, integration_test
  côté mobile) n'est encore en place — le smoke test du CD (`/actuator/health`, `/health`) et
  l'installation manuelle de l'APK ne remplacent pas un test E2E complet.
- Le seuil `npm audit --audit-level=high` peut bloquer sur des vulnérabilités de dépendances
  transitives sans correctif disponible : à surveiller et documenter au cas par cas plutôt que
  désactiver silencieusement le contrôle.
