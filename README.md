# Heroes & Powers

Full-stack sample application with an **Angular 19** frontend, a **NestJS 11** backend in `NestApi/`, and the original **.NET 10 Minimal API** kept in `SampleApi/` as the reference implementation.

## Project structure

```text
.
├── NestApi/        NestJS 11 backend (default backend target)
├── SampleApi/      .NET 10 Minimal API reference backend
├── sample-front/   Angular standalone frontend
└── .vscode/        Workspace launch/tasks for Nest, Angular, and SampleApi
```

## What the Nest backend reproduces

`NestApi/` mirrors the current `.NET` API contract used by the frontend:

| Method | Route | Description |
| --- | --- | --- |
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

The legacy JSON files still live in `NestApi/.data/heroes.json` and `NestApi/.data/powers.json`, but the Nest backend now targets MySQL through Prisma.

## How NestApi was created

The backend was scaffolded with the Nest CLI and then extended to match the existing `.NET` sample:

```bash
npx @nestjs/cli@latest new NestApi --package-manager npm --skip-git --strict
cd NestApi
npm install @nestjs/swagger swagger-ui-express class-validator class-transformer
```

The generated starter was then replaced with:

1. `heroes` and `powers` modules for the CRUD endpoints
2. A shared JSON-file storage service
3. OpenAPI/Swagger setup plus CORS for the Angular app
4. Docker packaging and root workspace wiring

## Run locally without Docker

### 1. Start the Nest backend

```bash
docker compose up -d mysql
cd NestApi
npm install
npm run prisma:migrate:deploy
npm run start:dev
```

Available URLs:

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi/v1.json`

### 2. Start the Angular frontend

```bash
cd sample-front
npm install
npm start
```

The Angular dev server runs on `http://localhost:4200` and now proxies `/api/*` to `http://localhost:3000`.

## Run from VS Code

Root `.vscode/launch.json` now provides:

| Name | What it does |
| --- | --- |
| **Backend (Nest)** | Starts the Nest backend in watch mode |
| **Frontend (npm)** | Starts Angular against the Nest backend |
| **Full Stack** | Starts Nest + Angular together |
| **Backend (dotnet)** | Starts the original `.NET` backend |
| **Frontend (npm - SampleApi)** | Starts Angular against the `.NET` backend |
| **Full Stack (.NET)** | Starts `.NET` + Angular together |
| **Backend (Docker debug)** | Keeps the existing Docker debug flow for `SampleApi` |

## Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

This starts:

- Traefik on `http://localhost:4208`
- Angular frontend behind Traefik
- Nest backend behind Traefik
- A shared MySQL instance with `sample_api` and `nest_api` schemas

Available URLs:

- App: `http://localhost:4208`
- API example: `http://localhost:4208/api/heroes`
- Swagger UI: `http://localhost:4208/docs`
- OpenAPI JSON: `http://localhost:4208/openapi/v1.json`

The Nest backend applies Prisma migrations on startup. The legacy JSON directory is still mounted so it can be used as optional manual seed input by enabling `JSON_SEED_ENABLED=true`.

## Validate the Nest backend

From `NestApi/`:

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

## Alternate .NET backend

`SampleApi/` stays available as the reference implementation.

### Run SampleApi directly

```bash
dotnet run --project SampleApi/SampleApi.csproj
```

It starts on `http://localhost:5025`, expects MySQL on `localhost:3306` with the `sample_api` schema, and applies the current EF Core migrations on startup.

### Run Angular against SampleApi

```bash
cd sample-front
npm run start:sampleapi
```

### Build SampleApi

```bash
dotnet build sample-back.slnx
```

### Run SampleApi with Docker Compose

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts the `.NET` API on `http://localhost:8008` plus MySQL. Existing JSON files stay in `SampleApi/.data/` and can be used as optional manual seed input by enabling `JsonSeed__Enabled=true`.
