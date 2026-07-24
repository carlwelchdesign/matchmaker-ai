# ADR-002 — TypeScript, Flutter, and monorepo tooling

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** Engineering
- **Reviewers:** Project owner
- **Decision deadline:** Before `ARG-101`

## Context

Argent requires public and operational web surfaces, a versioned API, background workers, and native iOS/Android applications. The repository must support deterministic local and CI workflows without pretending Flutter is a JavaScript package.

## Decision drivers

- Current stable framework support on the pinned runtime.
- Server-side rendering for public web.
- Low-overhead, schema-friendly API foundation.
- Fast focused tests and strict static analysis.
- Explicit integration of Flutter rather than forcing it through JavaScript tooling.

## Options considered

### pnpm and Turborepo; Next.js, Fastify, Vitest, Flutter

pnpm owns JavaScript workspaces, Turborepo owns their task graph, and root scripts invoke Flutter tooling explicitly.

### npm workspaces without a task graph

Fewer tools but weaker affected-build orchestration and caching.

### Full-stack framework for web and API

Fewer processes initially but a less explicit public API and worker boundary for mobile and operational clients.

## Security, privacy, operational, and cost implications

The web, API, and worker remain independently deployable. Exact dependency versions and Node/package-manager engines reduce environment drift. The approach adds pnpm/Turborepo supply-chain dependencies, which must be scanned and pinned in CI.

## Decision

- Node.js `24.18.0` LTS and pnpm `10.34.5`.
- TypeScript `6.0.3` workspaces orchestrated with pnpm and Turborepo. TypeScript 7 is deferred because the selected Next.js release fails its production build with it.
- Next.js App Router for the web surface.
- Fastify for the versioned HTTP API.
- A separate Node.js worker process.
- Vitest for TypeScript unit and boundary tests.
- Flutter stable for iOS and Android, verified through explicit root commands.

## Consequences

- Flutter does not appear in `pnpm-workspace.yaml`.
- Root `check` runs formatting, TypeScript checks/tests, Flutter analysis, and Flutter tests.
- OpenAPI generation, Docker, CI, identity, persistence, and design-token generation remain separate tickets.
- The Node pin was raised from `20.20.1` to `24.18.0` under `ARG-104` after
  scanning found vulnerable package-manager tooling in the end-of-life Node 20
  base. Distroless final images keep the vulnerability gate actionable without
  shipping package managers.

## Reversal or migration strategy

Frameworks may be replaced behind the web/API process boundaries. Generated OpenAPI clients will keep mobile and web consumers independent from the API framework.

## Evidence and approvals

- Runtime/package constraints are encoded in `.nvmrc`, `.node-version`, `.npmrc`, and `package.json`.
- Implementation ticket: [ARG-101](../tickets/ARG-101-platform-foundation.md)
