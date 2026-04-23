# Heroes & Powers

A full-stack sample application built with **.NET 10 Minimal API** and **Angular 19**.

## Features

- **Heroes** — CRUD for superhero profiles with real name, alias, origin, and linked powers
- **Powers** — CRUD for power definitions (name, description, type, level)
- **Signal Store** — reactive state via `@ngrx/signals`
- **Reactive forms** — type-safe Angular forms
- **JSON file storage** — data persisted in `.data/*.json` (no database required)

---

## Project structure

```
.
├── SampleApi/           .NET 10 Minimal API backend
│   ├── .data/           heroes.json, powers.json (seed data)
│   ├── Models/          IEntity, Hero, Power
│   ├── Records/         HeroRequest/Response, PowerRequest/Response
│   ├── Mappers/         HeroMapper, PowerMapper
│   ├── Services/        IEntityService, JsonRepository, EntityService, HeroService, PowerService
│   └── Endpoints/       HeroEndpoints, PowerEndpoints
└── sample-front/        Angular 19 standalone app
    └── src/app/
        ├── core/        models + API services
        ├── stores/      HeroStore, PowerStore (@ngrx/signals)
        └── features/    heroes, hero-detail, hero-form, power-form
```

---

## Getting started

### Backend

```bash
dotnet run --project SampleApi
```

API available at `http://localhost:5025`  
OpenAPI spec: `http://localhost:5025/openapi/v1.json`  
Scalar UI: `http://localhost:5025/scalar/v1`

### Frontend

```bash
cd sample-front
npm install
npm start        # proxies /api/* to http://localhost:5025 (local dotnet backend)
```

App available at `http://localhost:4200`

---

## VSCode launch configurations

Four configurations are available in `.vscode/launch.json`:

| Name | What it does |
|---|---|
| **Backend (dotnet)** | Builds and runs the API in debug mode via the dotnet CLI |
| **Frontend (npm)** | Runs `npm start` in `sample-front/` (proxies `/api/*` → `:5025`) |
| **Full Stack** | Compound — starts both above simultaneously |
| **Backend (Docker debug)** | Starts the debug Docker container and attaches vsdbg for remote debugging |

---

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/heroes` | List all heroes |
| GET | `/api/heroes/{id}` | Get hero by id |
| POST | `/api/heroes` | Create hero |
| PUT | `/api/heroes/{id}` | Update hero |
| DELETE | `/api/heroes/{id}` | Delete hero |
| GET | `/api/powers` | List all powers |
| GET | `/api/powers/{id}` | Get power by id |
| POST | `/api/powers` | Create power |
| PUT | `/api/powers/{id}` | Update power |
| DELETE | `/api/powers/{id}` | Delete power |

---

## Docker

### Development mode (port 8008)

Runs the backend in Docker with hot-reload (`dotnet watch`). The `.data/` JSON files are mounted from the host so data persists across container restarts. The frontend runs on the host.

```bash
# Terminal 1 — start backend container
docker compose -f docker-compose.dev.yml up --build

# Terminal 2 — start Angular dev server on host (proxies /api/* to port 8008)
cd sample-front
npm run start:docker
```

- Backend API: `http://localhost:8008`
- Frontend: `http://localhost:4200`
- OpenAPI / Scalar UI: `http://localhost:8008/scalar/v1`

### Release mode (port 4208)

Builds both backend and frontend images. Traefik routes `/api/*` to the backend and all other traffic to the Angular nginx container.

```bash
docker compose up --build
```

- App: `http://localhost:4208`
- API: `http://localhost:4208/api/heroes`

> **Note:** First build downloads AlmaLinux base images and installs packages — it may take a few minutes.

# dockers
