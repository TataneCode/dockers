# Observabilité & Benchmark

Tous les backends sont instrumentés avec **OpenTelemetry** (traces + logs) et exportent vers la stack
**grafana/otel-lgtm** (Loki, Grafana, Tempo, Prometheus dans une seule image Docker).

```text
Backends (OTLP gRPC :4317)
  ├─ nest-api    (NestJS 11)
  ├─ sample-api  (.NET 10)
  └─ rust-api    (Rust · Axum)
        │
        ▼
grafana/otel-lgtm  ── Tempo   (traces)
                   ── Loki    (logs)
                   ── Prometheus (métriques internes)
                   ── Grafana (dashboards, Explore)
```

> L'image `grafana/otel-lgtm` est conçue pour le dev/demo/testing — pas pour la production.

## Architecture

| Composant | Rôle |
|-----------|------|
| **Tempo** (uid `tempo`) | Stockage des traces distribuées |
| **Loki** (uid `loki`) | Agrégation des logs (corrélés aux traces via `trace_id`) |
| **Prometheus** (uid `prometheus`) | Métriques (collector interne, spanmetrics non générées ici) |
| **Grafana** | Visualisation, dashboards provisionnés, Explore |

Datasources et dashboards sont **auto-provisionnés** — aucune configuration manuelle requise.

## Connexion à Grafana

| Mode compose | URL | Auth |
|--------------|-----|------|
| Dev (`docker-compose.dev.yml`) | `http://localhost:3000` | Aucune — accès anonyme Admin |
| Release (`docker-compose.yml`) | `http://localhost:3000` | `admin` / `admin` |

L'image active par défaut l'authentification anonyme avec rôle Admin (`GF_AUTH_ANONYMOUS_ENABLED=true`).
Pour la désactiver :

```yaml
otel-lgtm:
  image: grafana/otel-lgtm:latest
  environment:
    GF_AUTH_ANONYMOUS_ENABLED: "false"
```

### Ingestion OTLP

| Protocole | Endpoint (depuis les conteneurs) |
|-----------|----------------------------------|
| gRPC | `http://otel-lgtm:4317` |
| HTTP | `http://otel-lgtm:4318` |

Variable d'environnement utilisée par les 3 backends : `OTEL_EXPORTER_OTLP_ENDPOINT`.

## Dashboard provisionné : « Heroes & Powers — API Benchmark »

Provisionné automatiquement au démarrage depuis `docker/grafana/heroes-powers-benchmark.json`.

| Montage dans le conteneur | Source repo |
|---------------------------|-------------|
| `/otel-lgtm/grafana/conf/provisioning/dashboards/custom.yaml` | `docker/grafana/dashboards-provider.yaml` |
| `/otel-lgtm/grafana/conf/provisioning/dashboards/custom/heroes-powers-benchmark.json` | `docker/grafana/heroes-powers-benchmark.json` |

### Panneaux

Le dashboard interroge Tempo via des **requêtes metrics TraceQL** (calculées à la volée par Tempo,
Grafana ≥ 10.4 — aucune métrique Prometheus n'est requise côté application) :

1. **Latence moyenne des requêtes HTTP** (avg duration) par backend et par route
2. **p95 des requêtes HTTP** (`quantile_over_time(0.95, duration)`)
3. **Débit req/s** (`rate()`)
4. **Traces récentes** par backend (nest-api, sample-api, rust-api) — cliquer une trace ouvre le flame graph

## Dashboard provisionné : « API Runtime — Mémoire & CPU des backends »

Provisionné automatiquement au démarrage depuis `docker/grafana/api-runtime.json`.

Chaque backend exporte désormais des **métriques de processus/runtime** via OTLP
(exportées toutes les 10 s vers le Prometheus interne d'otel-lgtm) :

| Métrique | nest-api | rust-api | sample-api |
|----------|----------|----------|------------|
| Mémoire résidente (RSS) | `process.memory.usage` (host-metrics) | `process.memory.usage` (lecture `/proc`) | `process.memory.usage` (Instrumentation.Process) |
| Mémoire virtuelle | `process.memory.virtual` | `process.memory.virtual` | `process.memory.virtual` |
| CPU (temps cumulé) | `process.cpu.time` | `process.cpu.time` | `process.cpu.time` |
| CPU (utilisation) | `process.cpu.utilization` | `process.cpu.utilization` | `process.cpu.utilization` |
| Uptime | `process.uptime` | `process.uptime` | `process.uptime` |
| Runtime-spécifique | event loop delay, heap Node (`instrumentation-runtime-node`) | — | heap GC, threadpool (`Instrumentation.Runtime`) |

Panneaux : RSS comparé des 3 backends, heap .NET, heap/event loop Node,
CPU temps et utilisation, threads & uptime.

> ⚠️ Les chiffres sont comparables entre backends **en mode release** uniquement.
> En dev, `dotnet watch` (SDK complet + JIT) et le hot reload Node gonflent
> artificiellement la mémoire et le CPU. Pour un comparatif honnête, utiliser
> `docker-compose.yml` (profil release).

### Tailles d'images Docker — repères dev vs prod

| Stack | Image dev (approx.) | Image prod attendue (approx.) |
|-------|--------------------|-------------------------------|
| RustApi | ~1,5–2 Go (toolchain `rust:1.87-slim` multi-stage) | ~30–80 Mo (binaire sur `bookworm-slim`, réductible vers distroless) |
| NestApi | ~1–1,5 Go (`node:22` + node_modules dev) | ~250–400 Mo (`node:22-slim` + deps prod) |
| SampleApi (.NET) | ~1,5–2 Go (`almalinux:9` + SDK .NET 10) | ~120–230 Mo (`mcr.microsoft.com/dotnet/aspnet:10.0`) |

La toolchain Rust est la plus lourde **au build** mais produit le runtime **le plus léger** ;
le dev .NET est lourd (SDK complet) mais compile instantanément. Ces tailles sont des
repères — mesurer réellement avec `docker compose build && docker images` après tout
changement de Dockerfile.
   des spans, et le lien **Logs** sur un span saute aux logs Loki corrélés

Pour le retrouver : menu **Dashboards** → *Heroes & Powers — API Benchmark*.

### Explorer manuellement

1. Grafana → **Explore**
2. Datasource **Tempo**
3. Requêtes utiles :
   - `{ resource.service.name = "nest-api" }`
   - `{ duration > 100ms }`
   - `{ status = error }`

## Benchmark depuis le frontend Angular

La page **`/benchmark`** (lien *Benchmark* dans la navbar) déclenche des appels **séquentiels** aux 3
backends et restitue les temps d'exécution **serveur** (header [`Server-Timing`](https://developer.mozilla.org/fr/docs/Web/HTTP/Reference/Headers/Server-Timing)) :

1. Choisir un endpoint (GET /heroes, GET /powers) et un nombre d'itérations (1–100)
2. Cliquer **Lancer le benchmark** — chaque backend est appelé à tour de rôle, sans interférence
3. Le tableau affiche min / moyenne / p95 / max (ms) du temps serveur par backend

> En dev local (hors Traefik), lancer le front avec `npm run start:benchmark` — le proxy
> `proxy.conf.benchmark.json` route `/api` (Nest), `/rust-api` (Rust) et `/sample-api` (.NET)
> vers les ports 5180 / 5181 / 5182 (préfixes `/rust-api` et `/sample-api` retirés via
> `pathRewrite`, comme le fait Traefik en release).

### Implémentation du header Server-Timing

| Backend | Fichier |
|---------|---------|
| NestJS | `NestApi/src/infrastructure/observability/server-timing.middleware.ts` |
| .NET | `DotnetApi/SampleApi/Middleware/ServerTimingMiddleware.cs` |
| Rust | `RustApi/src/api/middleware.rs` |

Format : `Server-Timing: app;dur=<ms>` (durée totale du traitement serveur de la requête).

## Instrumentation par backend

| Backend | Traces | Logs |
|---------|--------|------|
| NestJS | `@opentelemetry/auto-instrumentations-node` | `OTLPLogExporter` via `BatchLogRecordProcessor` |
| Rust/Axum | `tracing-opentelemetry` layer | `opentelemetry-appender-tracing` (bridge `tracing`) |
| .NET | `AddAspNetCoreInstrumentation()` | `ILogger` → `AddOtlpExporter()` |

## Persistance des données

Les données de l'image otel-lgtm sont persistées dans le volume `otel-lgtm-data`. Les anciens volumes
`tempo-data`, `loki-data`, `grafana-data` peuvent être supprimés après la migration :

```bash
docker volume rm dockers_tempo-data dockers_loki-data dockers_grafana-data
```
