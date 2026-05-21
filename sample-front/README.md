# sample-front

Angular 19 standalone frontend for the Heroes & Powers application.  
The dev server proxies `/api/*` to the selected backend via npm run scripts.

## Run locally

```bash
npm install

npm run start:nestapi    # proxy /api → localhost:3000  (NestApi)
npm run start:rustapi    # proxy /api → localhost:3001  (RustApi)
npm run start:sampleapi  # proxy /api → localhost:5025  (SampleApi)
```

Open `http://localhost:4200` in your browser.

Each script uses a dedicated proxy config:

| Script | Proxy config | Target |
|--------|-------------|--------|
| `start:nestapi` | `proxy.conf.json` | `http://localhost:3000` |
| `start:rustapi` | `proxy.conf.rustapi.json` | `http://localhost:3001` |
| `start:sampleapi` | `proxy.conf.sampleapi.json` | `http://localhost:5025` |

## Build

```bash
npm run build          # production build → dist/sample-front/browser/
npm run watch          # watch build (development configuration)
```

## Unit tests

```bash
npm test               # run all specs with Karma once
```

## Docker (release)

The production image is built as part of the release Docker Compose from the repository root:

```bash
docker compose up --build frontend
```

The image uses a multi-stage build (`node:22` → `almalinux:9-minimal` + nginx) and serves the Angular app over plain HTTP on port 80.  
TLS is terminated upstream by Traefik — see the root `README.md` for the HTTPS certificate setup.

