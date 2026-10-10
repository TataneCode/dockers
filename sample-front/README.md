# sample-front

Angular 22 standalone frontend for the Heroes & Powers application.  
The dev server proxies `/api/*` to the selected backend via npm run scripts.

## Run locally

```bash
npm install

npm run start:nestapi    # proxy /api → localhost:5180  (NestApi)
npm run start:rustapi    # proxy /api → localhost:5181  (RustApi)
npm run start:sampleapi  # proxy /api → localhost:5182  (SampleApi)
```

Open `http://localhost:4200` in your browser.

Each script uses a dedicated proxy config:

| Script | Proxy config | Target |
|--------|-------------|--------|
| `start:nestapi` | `proxy.conf.json` | `http://localhost:5180` |
| `start:rustapi` | `proxy.conf.rustapi.json` | `http://localhost:5181` |
| `start:sampleapi` | `proxy.conf.sampleapi.json` | `http://localhost:5182` |

## Build

```bash
npm run build          # production build → dist/sample-front/browser/
npm run watch          # watch build (development configuration)
```

## Unit tests

```bash
npm test               # run all specs with Vitest
```

## Docker (release)

The production image is built as part of the release Docker Compose from the repository root:

```bash
docker compose up --build frontend
```

The image uses a multi-stage build (`node:22` → `almalinux:9-minimal` + nginx) and serves the Angular app over plain HTTP on port 80.  
TLS is terminated upstream by Traefik — see the root `README.md` for the HTTPS certificate setup.
