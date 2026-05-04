# NestApi

NestJS 11 backend for the Heroes & Powers sample. It mirrors the `SampleApi/` CRUD contract with JSON-file persistence under `.data/`.

## Local commands

```bash
npm install
npm run start:dev
```

The API starts on `http://localhost:3000`, Swagger UI is at `http://localhost:3000/docs`, and the OpenAPI document is at `http://localhost:3000/openapi/v1.json`.

## Validation

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

## Docker

Build the production image from the repository root with:

```bash
docker compose up --build
```

The full project workflow is documented in the repository root `README.md`.
