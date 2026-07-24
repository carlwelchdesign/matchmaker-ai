# Argent Matchmaking

Argent is a discreet, human-led matchmaking platform. This monorepo contains the public/staff web application, Flutter iOS and Android application, API, worker, framework-light domain policy, contracts boundary, and design-system boundary.

## Workspace

```text
apps/web               Next.js web surface
apps/mobile            Flutter iOS and Android application
services/api           Fastify HTTP API
services/worker        Background worker process
packages/domain        Framework-light domain policy
packages/contracts     OpenAPI and generated clients (ARG-102)
packages/design-system Nocturne tokens and adapters (ARG-118)
packages/config        Shared build and quality configuration
plans                  Canonical plans, tickets, decisions, and risks
```

## Local requirements

- Node.js `20.20.1`
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

When an API route schema changes, regenerate both checked-in clients:

```bash
pnpm contracts:generate
pnpm contracts:check
```

No application, admission, matching, AI, or conversational-intake feature should be added without its ticket and documented readiness gates.
