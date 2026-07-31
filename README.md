# Argent Matchmaking

Argent is a discreet, human-led matchmaking platform. This monorepo contains the public/staff web application, Flutter iOS and Android application, API, worker, framework-light domain policy, server-only database foundation, contracts boundary, and design-system boundary.

The current local screen is a **synthetic concept prototype** for product review.
It has no accounts, submission, storage, real profiles, matching, or production
workflow. Do not use it to collect personal information.

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/073c4a3b-36bc-4482-b67d-9aae8faa3f16" />


## Workspace

```text
apps/web               Public/applicant Next.js web surface
apps/admin             Separately deployed owner/staff Next.js admin surface
apps/mobile            Flutter iOS and Android application
services/api           Fastify HTTP API
services/worker        Background worker process
packages/domain        Framework-light domain policy
packages/database      Server-only migrations and synthetic fixture boundary
packages/contracts     OpenAPI and generated clients (ARG-102)
packages/design-system Nocturne tokens and adapters (ARG-118)
packages/config        Shared build and quality configuration
plans                  Canonical plans, tickets, decisions, and risks
```

## Local requirements

- Node.js `24.18.0`
- pnpm `10.34.5`
- Flutter stable with Dart `3.12.2` or compatible
- Docker Desktop for the later Docker environment ticket

## Foundation verification

```bash
nvm use
corepack prepare pnpm@10.34.5 --activate
pnpm install
pnpm verify
```

The Flutter application is intentionally outside the pnpm workspace. Root checks invoke `flutter analyze` and `flutter test` explicitly.

## Docker development environment

Build and run the application services with isolated local PostgreSQL and
Redis:

```bash
docker compose up --build --wait
```

The public web surface is available at `http://localhost:3000`, the separately
deployed admin surface at `http://localhost:3002`, and API liveness at
`http://localhost:3001/health/live`. PostgreSQL and Redis bind to loopback only.
Override local ports and credentials with environment variables shown in
`compose.yaml`.

Run the disposable end-to-end container path on isolated ports:

```bash
pnpm docker:smoke
```

The smoke path builds all three application images, waits for five healthy
services, verifies web/API/data-service responses, confirms worker startup, and
checks graceful API/worker shutdown. It removes its isolated volumes unless
`KEEP_ARGENT_SMOKE_STACK=1` is set.

When an API route schema changes, regenerate both checked-in clients:

```bash
pnpm contracts:generate
pnpm contracts:check
```

Exercise the reversible database foundation against an isolated pinned
PostgreSQL container:

```bash
pnpm db:smoke
```

For an existing local database, migrations require an explicit `DATABASE_URL`.
Synthetic fixtures also require `ARGENT_ENVIRONMENT=local`; production is
always refused and staging requires `ALLOW_SYNTHETIC_SEED=true`.

```bash
DATABASE_URL=postgresql://argent:argent-local-only@127.0.0.1:5432/argent \
  pnpm db:migrate
DATABASE_URL=postgresql://argent:argent-local-only@127.0.0.1:5432/argent \
  ARGENT_ENVIRONMENT=local \
  pnpm db:seed
```

No application, admission, matching, AI, or conversational-intake feature should be added without its ticket and documented readiness gates.

## Continuous integration

Pull requests run named quality, secret, dependency, CodeQL, and container
security checks. Container checks build the public web, admin, API, and worker images, reject
high or critical vulnerabilities, and retain an SPDX JSON SBOM for each image.
All third-party workflow actions and application base images are immutable
pins.

Run the repository-side CI policy validation locally with:

```bash
pnpm ci:check
```

Required-check enforcement on `main` is tracked separately in `ARG-100`.
