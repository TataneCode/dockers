# RustApi

Rust backend for the Heroes & Powers sample, built with **Axum** (HTTP) and **SQLx** (MySQL).  
It reproduces the same REST API contract as `NestApi/` and `SampleApi/`.

## Stack

| Concern | Crate |
|---------|-------|
| Async runtime | `tokio` |
| HTTP framework | `axum` |
| Database | `sqlx` (MySQL, runtime-tokio) |
| Serialisation | `serde` / `serde_json` |
| IDs | `uuid` v4 |
| OpenAPI + UI | `utoipa` + `utoipa-scalar` |
| Errors | `thiserror` / `anyhow` |
| Config | `dotenvy` |
| Logging | `tracing` / `tracing-subscriber` |

## Architecture

```text
src/
├── config.rs                 AppConfig (reads env vars / .env)
├── domain/
│   ├── models/               Hero, Power structs
│   └── repositories/         HeroRepository, PowerRepository traits
├── application/
│   ├── errors.rs             AppError (InvalidPowerReference, Internal)
│   ├── hero_service.rs       business logic, power validation, ID generation
│   └── power_service.rs
├── infrastructure/
│   ├── db.rs                 MySqlPool creation
│   ├── repositories/         SqlxHeroRepository, SqlxPowerRepository
│   └── seeding/              JSON seed (powers.json + heroes.json)
└── api/
    ├── app_state.rs          AppState + DynHeroService / DynPowerService
    ├── error.rs              ApiError → IntoResponse (404 / 422 / 500)
    ├── dto/                  HeroRequest/Response, PowerRequest/Response
    ├── handlers/             heroes.rs, powers.rs (Axum handlers)
    ├── openapi.rs            utoipa ApiDoc
    └── routes.rs             Router wiring
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | *(required)* | MySQL connection string |
| `PORT` | `3000` | Port to listen on |
| `JSON_SEED_ENABLED` | `false` | Seed DB from JSON on startup |
| `JSON_SEED_DATA_PATH` | `.data` | Folder containing `powers.json` and `heroes.json` |
| `RUST_LOG` | — | Log filter (e.g. `rust_api=info`) |

Copy `.env` and adjust for local development:

```bash
DATABASE_URL=mysql://heroes_app:heroes_app@localhost:3306/rust_api
PORT=3001
JSON_SEED_ENABLED=true
JSON_SEED_DATA_PATH=.data
```

## Run locally

```bash
# Start MySQL (shared with other backends)
docker compose up -d mysql

cargo run
```

Available endpoints once running:

| URL | Description |
|-----|-------------|
| `http://localhost:3001/api/heroes` | Heroes CRUD |
| `http://localhost:3001/api/powers` | Powers CRUD |
| `http://localhost:3001/scalar` | Scalar OpenAPI UI |
| `http://localhost:3001/openapi.json` | OpenAPI spec |

## Migrations

SQLx migrations live in `migrations/`. They are applied automatically at startup via `sqlx::migrate!`.  
The migration history is tracked in `_sqlx_migrations` inside the `rust_api` schema — fully isolated from the NestJS (Prisma) and .NET (EF Core) schemas.

To create a new migration manually:

```bash
sqlx migrate add <name>
```

## Build

```bash
cargo build           # debug
cargo build --release # release
```

## Docker

```bash
# From repository root
docker compose up --build rust-backend
```

The image uses a multi-stage build (`rust:1.87-slim` → `debian:bookworm-slim`).  
TLS is not handled by the application — it is terminated upstream by Traefik or a k3s ingress.
