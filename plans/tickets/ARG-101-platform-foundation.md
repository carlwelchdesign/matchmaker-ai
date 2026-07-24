# ARG-101 — Platform foundation

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-006, CAP-007, CAP-008
- **Priority:** P0
- **Status:** In progress
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** M
- **Dependencies:** ARG-009, ARG-013, ARG-019
- **Decision/risk links:** ADR-001, ADR-002, ADR-014, R-008, R-015, R-020
- **Blocked reason/review date:** Product owner authorized a framework-only start on 2026-07-23; no gated product lifecycle or mobile-contract behavior is included

## Outcome

Create a reproducible TypeScript and Flutter monorepo with explicit web, mobile, API, worker, domain, contracts, design-system, and shared-configuration boundaries.

## Scope

- Pin supported Node and package-manager versions.
- Establish pnpm workspaces and a Turborepo task graph.
- Scaffold Next.js web, Fastify API, Node worker, and Flutter iOS/Android applications.
- Establish a framework-light server domain package.
- Establish documented client-safe contract and design-system boundaries.
- Add minimal liveness/foundation behavior and focused tests for each runtime.

## Non-goals

- Docker or stateful local infrastructure (`ARG-103`).
- OpenAPI generation or generated clients (`ARG-102`).
- Authentication, persistence, queues, telemetry, product workflows, or AI.
- Final Nocturne token generation (`ARG-118`).
- A production readiness endpoint; dependency readiness begins with infrastructure tickets.

## Acceptance criteria

- [x] Repository shape matches the approved architecture.
- [x] Node and pnpm engines are exact and documented.
- [x] Web, API, worker, domain, and Flutter projects have explicit build/test boundaries.
- [x] Server-only domain code is not imported by web or Flutter.
- [x] API liveness is tested through in-process HTTP injection.
- [x] Worker start, stop, and duplicate-start behavior are tested.
- [x] Flutter foundation renders under a widget test and passes static analysis.
- [x] Root TypeScript format, type, test, and build checks pass.
- [x] Runtime smoke checks pass for built web, API, and worker entry points.
- [ ] Intended changes are committed and reviewed in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: No personal data; static foundation strings only.
- Data-flow changes: New process boundaries, no external providers or persistence.
- Roles/permissions: Not implemented; no protected routes or workflows.
- Consent/retention: Not applicable.
- Deletion/revocation effects: Not applicable.
- Threats/abuse: Accidental client bundling of server policy; environment drift; unsafe unknown routes.
- AI level and review: No AI.
- Accessibility: Web semantic structure and Flutter safe-area/text-scaling foundations; detailed checks remain feature-specific.
- Logging/redaction: Worker logs structured lifecycle metadata only; API logger has no personal payloads.

## Implementation checklist

- [x] Confirm approved dependency fallback and ADRs.
- [x] Establish package and process boundaries.
- [x] Implement the smallest coherent health/foundation behavior.
- [x] Add success, invalid-input, unknown-route, and lifecycle tests.
- [x] Install from the lockfile on the pinned runtime.
- [x] Run all static, test, build, and runtime checks.
- [x] Review diff for generated noise and forbidden coupling.
- [ ] Update delivery evidence and move to review.

## Verification evidence

- [x] Focused tests: 7 TypeScript tests and 1 Flutter widget test pass.
- [x] Static/quality checks: Prettier, strict TypeScript, Flutter analysis, and `git diff --check` pass.
- [x] Security/privacy checks: Production dependency audit reports no known vulnerabilities after patched `sharp` and `postcss` overrides; no personal data or provider calls exist.
- [x] Accessibility/visual checks: Semantic web foundation builds; Flutter renders within `SafeArea` and supports platform text scaling.
- [x] Runtime/deployment checks: Standalone web returned expected copy; API returned the versioned liveness payload; worker remained live and logged graceful direct-process shutdown; Android debug APK and iOS simulator app built.
- [x] Rollout/rollback evidence: Additive scaffold only; rollback is the ticket commit before any state or migration exists.

## Delivery evidence

- Branch: `ticket/ARG-101-platform-foundation`
- Commit:
- PR:
- Merge:
- Deployment: Not in scope
- Evidence URLs/paths:
- Completion date:

## Completion notes

The first build exposed and resolved two foundation issues: Next.js failed its production build with TypeScript 7, so TypeScript is pinned to 6.0.3; the production audit found vulnerable transitive `sharp` and `postcss` versions, so patched compatible versions are enforced and the audit rerun clean.

The liveness route proves only that the API process can serve requests. It intentionally does not claim database, queue, provider, or production readiness.

- Follow-up owner: ARG-102 and ARG-103
