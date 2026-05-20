# Heroes & Powers

Full-stack sample application with an **Angular 19** frontend and three backend implementations that expose the same Heroes & Powers REST API:

| Directory | Stack | DB schema |
|-----------|-------|-----------|
| `NestApi/` | NestJS 11 + Prisma | `nest_api` |
| `SampleApi/` | .NET 10 Minimal API + EF Core | `sample_api` |
| `RustApi/` | Rust · Axum + SQLx | `rust_api` |

## Project structure

```text
.
├── NestApi/        NestJS 11 backend
├── SampleApi/      .NET 10 Minimal API backend
├── RustApi/        Rust (Axum + SQLx) backend
├── sample-front/   Angular 19 standalone frontend
└── .vscode/        Workspace launch/tasks
```

## API contract (identical across all backends)

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

## Run locally without Docker

### NestJS backend

```bash
docker compose up -d mysql
cd NestApi
npm install
npm run prisma:migrate:deploy
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi/v1.json`

### Rust backend

```bash
docker compose up -d mysql
cd RustApi
cp .env.example .env   # or edit DATABASE_URL / PORT directly
cargo run
```

- API: `http://localhost:3001`
- Scalar UI: `http://localhost:3001/scalar`
- OpenAPI JSON: `http://localhost:3001/openapi.json`

The Rust backend runs its own SQLx migrations on startup against the `rust_api` schema and optionally seeds data from `.data/powers.json` and `.data/heroes.json` when `JSON_SEED_ENABLED=true`.

### Angular frontend

```bash
cd sample-front
npm install
npm start
```

The Angular dev server runs on `http://localhost:4200` and proxies `/api/*` to the active backend.

## Run from VS Code

Root `.vscode/launch.json` provides:

| Name | What it does |
|------|-------------|
| **Backend (Nest)** | Starts the Nest backend in watch mode |
| **Frontend (npm)** | Starts Angular against the Nest backend |
| **Full Stack** | Starts Nest + Angular together |
| **Backend (dotnet)** | Starts the .NET backend |
| **Frontend (npm - SampleApi)** | Starts Angular against the .NET backend |
| **Full Stack (.NET)** | Starts .NET + Angular together |
| **Backend (Docker debug)** | Docker debug flow for SampleApi |

## Run with Docker Compose

```bash
docker compose up --build
```

This starts:

- Traefik on `http://localhost:4208`
- Angular frontend
- NestJS backend (`nest_api` schema)
- Rust backend (`rust_api` schema)
- Shared MySQL instance

| Service | URL via Traefik |
|---------|----------------|
| Angular frontend | `http://localhost:4208/` |
| NestJS API | `http://localhost:4208/api/` |
| NestJS Swagger | `http://localhost:4208/docs` |
| Rust API | `http://localhost:4208/rust-api/api/` |
| Rust Scalar UI | `http://localhost:4208/rust-api/scalar` |

Each backend applies its own migrations on startup. TLS termination is handled by Traefik; all backends listen on plain HTTP internally.

## Validate / build

### NestJS

```bash
cd NestApi
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

### Rust

```bash
cd RustApi
cargo build
cargo test
```

### .NET

```bash
dotnet build sample-back.slnx
```

## Alternate .NET backend

`SampleApi/` stays available as the reference implementation.

```bash
dotnet run --project SampleApi/SampleApi.csproj
```

Starts on `http://localhost:5025`, schema `sample_api`, applies EF Core migrations on startup.

```bash
# Docker Compose (dev)
docker compose -f docker-compose.dev.yml up --build
```
