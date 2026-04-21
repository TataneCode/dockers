# Copilot Instructions

## Repository overview

This repository contains two separate sample applications:

- `SampleApi/` is a minimal ASP.NET Core API targeting `net10.0`. It is the only project in `sample-back.slnx`.
- `sample-front/` is an Angular 19 application created with Angular CLI.

There is no root-level orchestrator for running both apps together, no shared library between them, and no existing frontend-to-backend integration layer. Treat backend and frontend work as separate unless you add that wiring explicitly.

## Build and test commands

### Backend (`SampleApi/`)

- Build: `dotnet build sample-back.slnx`
- Run locally: `dotnet run --project SampleApi/SampleApi.csproj`

### Frontend (`sample-front/`)

Run these from `sample-front/`:

- Dev server: `npm run start`
- Build: `npm run build`
- Watch build: `npm run watch`
- Full unit test suite: `npm test`
- Single spec file: `npm test -- --watch=false --include src/app/app.component.spec.ts`

There is no lint script or Angular lint target configured in the current workspace.
Copilot cloud-agent setup lives in `.github/workflows/copilot-setup-steps.yml` and preinstalls frontend dependencies, the .NET 10 SDK, and Playwright Chromium.

## High-level architecture

### Backend

- `SampleApi/Program.cs` contains the entire API. It uses top-level statements and the minimal API style; there are no controllers, service classes, or separate endpoint modules yet.
- OpenAPI is registered with `AddOpenApi()` and only exposed in Development via `app.MapOpenApi()`.
- The only current endpoint is `GET /weatherforecast`, which returns generated in-memory data.
- Development launch settings are in `SampleApi/Properties/launchSettings.json`, with HTTP on `http://localhost:5025` and HTTPS on `https://localhost:7131`.

### Frontend

- `sample-front/src/main.ts` bootstraps the app with `bootstrapApplication`, not an `NgModule`.
- `sample-front/src/app/app.config.ts` provides app-wide configuration, currently router setup plus `provideZoneChangeDetection`.
- `sample-front/src/app/app.routes.ts` exists but currently exports an empty route array.
- `sample-front/src/app/app.component.ts` is a standalone root component. The current HTML template is still the Angular starter placeholder.
- Angular CLI is configured for SCSS and outputs browser builds to `dist/sample-front`.

## Key conventions

- Prefer Angular standalone APIs. New components should follow the existing standalone pattern instead of introducing an `AppModule`.
- Keep Angular routing changes in `src/app/app.routes.ts` and shared application providers in `src/app/app.config.ts`.
- Use SCSS for component and global styles; Angular schematics are already configured that way in `angular.json`.
- Preserve strict TypeScript and Angular template checking. `tsconfig.json` enables strict compiler options and `strictTemplates`.
- Follow the existing Angular test pattern for standalone components: import the component directly in `TestBed.configureTestingModule({ imports: [...] })`.
- Follow the existing formatting rules from `sample-front/.editorconfig`: 2-space indentation, UTF-8, final newlines, and single quotes in TypeScript.
- On the backend, extend the existing minimal API style unless there is a clear reason to introduce additional layers; current behavior is centered in `Program.cs`.
