# Heroes & Powers

Full-stack sample application with an **Angular 22** frontend and three backend implementations that expose the same Heroes & Powers REST API.

| Directory | Stack | DB schema |
|-----------|-------|-----------|
| `NestApi/` | NestJS 11 + Prisma | `nest_api` |
| `DotnetApi/` | .NET 10 Minimal API + EF Core | `sample_api` |
| `RustApi/` | Rust · Axum + SQLx | `rust_api` |

## Project structure

```text
.
├── NestApi/        NestJS 11 backend
├── DotnetApi/      .NET 10 backend workspace
│   ├── SampleApi/                  Minimal API host
│   ├── SampleApi.Application/      Application layer
│   ├── SampleApi.Application.Tests/
│   ├── SampleApi.Domain/
│   ├── SampleApi.Infrastructure/
│   └── sample-back.slnx
├── RustApi/        Rust (Axum + SQLx) backend
├── sample-front/   Angular 22 standalone frontend
├── docker/
│   ├── certs/              mkcert certificates (git-ignored)
│   ├── grafana/            Grafana dashboards + provisioning (otel-lgtm)
│   ├── mysql/init/         MySQL init SQL scripts
│   └── traefik/dynamic/    Traefik TLS dynamic config
├── docs/
│   └── observability.md   Observability & benchmark guide (Grafana, Tempo, Server-Timing)
├── archive/        Previous docker-compose files
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

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- [Node.js 22+](https://nodejs.org/) — for local frontend / NestApi development
- [.NET 10 SDK](https://dotnet.microsoft.com/download) — for local SampleApi development
- [Rust](https://rustup.rs/) — for local RustApi development
- [mkcert](https://github.com/FiloSottile/mkcert) — for local HTTPS certificates (release compose only)

## HTTPS certificate setup (mkcert)

The release Docker Compose (`docker-compose.yml`) runs Traefik with HTTPS on port **4443**.  
Traefik reads a locally-trusted certificate from `docker/certs/`. Follow these steps once per machine.

### 1 — Install mkcert

```bash
# macOS
brew install mkcert

# Windows (Chocolatey)
choco install mkcert

# Linux (apt)
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

### 2 — Install the local CA

This registers the mkcert CA in your system/browser trust stores so the certificate is accepted without warnings.

```bash
mkcert -install
```

### 3 — Generate the certificate

Run this from the repository root. The files land directly in the directory Traefik mounts.

```bash
mkcert \
  -cert-file docker/certs/local.pem \
  -key-file  docker/certs/local-key.pem \
  localhost 127.0.0.1
```

The certificate files are git-ignored. You only need to regenerate them if you delete them or move to a new machine.

## Run locally without Docker

Start only the database (shared across all backends):

```bash
docker compose -f docker-compose.dev.yml up -d mysql
```

### NestJS backend

```bash
cd NestApi
npm install
npm run start:dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:3000/api/heroes` | Heroes CRUD |
| `http://localhost:3000/docs` | Scalar OpenAPI UI |
| `http://localhost:3000/openapi/v1.json` | OpenAPI spec |

### .NET backend

```bash
dotnet run --project DotnetApi/SampleApi/SampleApi.csproj
```

| URL | Description |
|-----|-------------|
| `http://localhost:5025/api/heroes` | Heroes CRUD |
| `http://localhost:5025/docs` | Scalar OpenAPI UI |
| `http://localhost:5025/openapi/v1.json` | OpenAPI spec |

### Rust backend

```bash
cd RustApi
cargo run
```

| URL | Description |
|-----|-------------|
| `http://localhost:3001/api/heroes` | Heroes CRUD |
| `http://localhost:3001/docs` | Scalar OpenAPI UI |
| `http://localhost:3001/openapi.json` | OpenAPI spec |

### Angular frontend

Run with the desired backend proxy:

```bash
cd sample-front
npm install

npm run start:nestapi    # proxy /api → localhost:5180 (NestApi)
npm run start:rustapi    # proxy /api → localhost:5181 (RustApi)
npm run start:sampleapi  # proxy /api → localhost:5182 (SampleApi)
npm run start:benchmark  # proxy /api + /rust-api + /sample-api (benchmark des 3 backends)
```

The proxy targets (`5180` / `5181` / `5182`) match the ports published by the Docker dev stack
(`docker-compose.dev.yml`). When running a backend natively instead, its own port applies
(3000 for NestApi and RustApi, 5025 for SampleApi).

Frontend runs on `http://localhost:4200`.

## Run with Docker Compose — development

Starts MySQL, all three APIs, and the otel-lgtm monitoring stack. Ports are exposed for local frontend development.  
The Angular frontend is served separately with `npm run start:<api>`.

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Service | Host port |
|---------|-----------|
| MySQL | 3306 |
| NestApi | 5180 |
| RustApi | 5181 |
| SampleApi | 5182 |
| Grafana (otel-lgtm) | 3000 *(open, no login)* |

> Grafana URL: `http://localhost:3000` — no credentials required in dev mode.

## Run with Docker Compose — release

> **Requires the mkcert certificate** — see [HTTPS certificate setup](#https-certificate-setup-mkcert) above.

Starts the full stack (DB + 3 APIs + Traefik + Angular frontend + otel-lgtm monitoring).  
HTTP on port 4208 redirects automatically to HTTPS on port **4443**.

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Angular frontend | `https://localhost:4443/` |
| NestJS API | `https://localhost:4443/api/` |
| NestJS docs | `https://localhost:4443/docs` |
| Rust API | `https://localhost:4443/rust-api/api/` |
| Rust docs | `https://localhost:4443/rust-api/docs` |
| SampleApi | `https://localhost:4443/sample-api/api/` |
| SampleApi docs | `https://localhost:4443/sample-api/docs` |
| Grafana (otel-lgtm) | `http://localhost:3000` *(admin / admin)* |

TLS is terminated by Traefik using the mkcert certificate in `docker/certs/`.  
The dynamic TLS configuration is in `docker/traefik/dynamic/tls.yml`.

## Run from VS Code

Root `.vscode/launch.json` provides the following configurations:

| Name | What it does |
|------|-------------|
| **Backend (Nest)** | Starts NestApi in watch mode (`npm run start:dev`) |
| **Backend (NestApi Docker)** | Builds + runs NestApi via Docker with Node debugger |
| **Backend (dotnet)** | Starts SampleApi with the .NET debugger |
| **Backend (Docker debug)** | Builds + runs SampleApi debug container with vsdbg |
| **Backend (RustApi)** | Starts RustApi via `cargo run` |
| **Frontend (npm - NestApi)** | Angular dev server proxied to NestApi (port 5180) |
| **Frontend (npm - RustApi)** | Angular dev server proxied to RustApi (port 5181) |
| **Frontend (npm - SampleApi)** | Angular dev server proxied to SampleApi (port 5182) |

Compound configurations:

| Name | Starts |
|------|--------|
| **Full Stack (NestApi)** | Backend (Nest) + Frontend (npm - NestApi) |
| **Full Stack (.NET)** | Backend (dotnet) + Frontend (npm - SampleApi) |
| **Full Stack (Rust)** | Backend (RustApi) + Frontend (npm - RustApi) |

## Observability & Benchmark

All three backends are instrumented with **OpenTelemetry** and export traces and logs to the
**grafana/otel-lgtm** all-in-one image (Loki, Grafana, Tempo, Prometheus). A Grafana dashboard
comparing API execution times across backends is auto-provisioned, and the Angular frontend ships
with a `/benchmark` page that triggers sequential calls to the three APIs and reports server-side
durations (via the `Server-Timing` header).

➡️ Full guide: [docs/observability.md](docs/observability.md)

## Build & validate

### NestJS

```bash
cd NestApi
npm run build
npm test
```

### Rust

```bash
cd RustApi
cargo build
cargo test
```

### .NET

```bash
dotnet build DotnetApi/sample-back.slnx
dotnet test DotnetApi/sample-back.slnx
```

### Angular

```bash
cd sample-front
npm run build
npm test
```
