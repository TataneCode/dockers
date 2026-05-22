# NestApi

NestJS 11 backend for the Heroes & Powers application.  
Uses **Prisma** for database access against a MySQL `nest_api` schema and exposes Scalar + OpenAPI.

## Run locally

```bash
# Start MySQL (shared with other backends)
docker compose -f docker-compose.dev.yml up -d mysql

npm install
npm run start:dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:3000/api/heroes` | Heroes CRUD |
| `http://localhost:3000/api/powers` | Powers CRUD |
| `http://localhost:3000/docs` | Scalar OpenAPI UI |
| `http://localhost:3000/openapi/v1.json` | OpenAPI spec |

Prisma migrations are applied automatically on startup via `prisma migrate deploy` (bundled in `start:prod`).  
For local dev (`start:dev`) ensure migrations are up to date with:

```bash
npm run prisma:migrate:deploy
```

## Validate

```bash
npm run build
npm test
```

## Docker

### Development compose

The `nest-api` service in `docker-compose.dev.yml` exposes port **3000** on the host so the Angular dev server can proxy to it.

```bash
docker compose -f docker-compose.dev.yml up --build nest-api
```

### Release compose

In `docker-compose.yml` the service is behind Traefik (HTTPS on port 4443).  
Routes: `/api`, `/docs`, `/openapi`.

```bash
docker compose up --build nest-api
```

See the root `README.md` for the full stack startup and mkcert HTTPS setup.
