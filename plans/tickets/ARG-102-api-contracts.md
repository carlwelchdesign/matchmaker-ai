# ARG-102 — API contracts

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-006, CAP-007
- **Priority:** P0
- **Status:** In review
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** S
- **Dependencies:** ARG-019, ARG-101
- **Decision/risk links:** ADR-007, ADR-011, ADR-014, R-031
- **Blocked reason/review date:** Product owner authorized the client-safe contract mechanism on 2026-07-23; product API retirement policy remains owned by ARG-019

## Outcome

Establish one reproducible OpenAPI boundary and generated TypeScript and Dart
clients, with drift and consumer-behavior checks.

## Scope

- Emit OpenAPI from Fastify route schemas.
- Generate pinned TypeScript Fetch and Dart Dio clients.
- Check generated artifacts into the repository.
- Compile and behavior-test both consumer paths.
- Reject generated-client drift in root verification.

## Non-goals

- Product, identity, campaign, matching, or intake endpoints.
- Mobile forced-update or final support-window policy (`ARG-019`).
- Database, queue, or container readiness (`ARG-103`).

## Acceptance criteria

- [x] The API emits a valid OpenAPI document containing liveness.
- [x] TypeScript and Dart clients are generated from the same document.
- [x] Generated clients compile in their consuming toolchains.
- [x] Consumer tests exercise generated model and operation behavior.
- [x] Regeneration is deterministic and a drift check is part of verification.
- [x] API compatibility and package-boundary ADRs are accepted.
- [x] Security and production dependency checks pass.
- [ ] Intended changes are committed and reviewed in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: Operational service health only; no personal data.
- Data-flow changes: Adds a public, client-safe schema boundary.
- Roles/permissions: No protected product endpoints in this slice.
- Consent/retention: Not applicable.
- Deletion/revocation effects: Not applicable.
- Threats/abuse: Accidental exposure of server schemas; stale clients; generator supply-chain drift.
- AI level and review: No AI.
- Accessibility: No user interface change.
- Logging/redaction: No payload logging or personal fields.

## Implementation checklist

- [x] Confirm generation and compatibility decisions.
- [x] Add route schemas and OpenAPI emission.
- [x] Pin and configure both generators.
- [x] Add deterministic cleanup and postprocessing.
- [x] Add TypeScript and Flutter consumer tests.
- [x] Run static, test, build, drift, and security checks.
- [x] Review generated diff and forbidden coupling.
- [x] Update delivery evidence and move to review.

## Verification evidence

- [x] Focused tests: 11 TypeScript tests and 2 Flutter tests pass, including generated-client request and model behavior.
- [x] Static/quality checks: Prettier, strict TypeScript, Flutter analysis, all production builds, deterministic contract regeneration, and `git diff --check` pass.
- [x] Security/privacy checks: Production dependency audit reports no known vulnerabilities; the schema contains operational health data only.
- [ ] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: API injection verifies the emitted schema and generated TypeScript request test verifies `/health/live`; deployment is not in scope.
- [x] Rollout/rollback evidence: Additive client-safe contract only; rollback removes generated clients and Swagger registration without any data migration.

## Delivery evidence

- Branch: `ticket/ARG-102-api-contracts`
- Commit:
- PR:
- Merge:
- Deployment: Not in scope
- Evidence URLs/paths:
- Completion date:

## Completion notes

- Follow-up owner: ARG-019 and ARG-103
