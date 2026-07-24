# ARG-107 — Database migration and synthetic fixture foundation

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-007
- **Priority:** P0
- **Status:** Done
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** M
- **Dependencies:** ARG-101
- **Decision/risk links:** ADR-022, R-014, R-031
- **Blocked reason/review date:** Not blocked

## Outcome

Give engineers and CI one deterministic, privacy-safe way to migrate a fresh
PostgreSQL database, install approved non-production fixtures, prove
idempotency, reverse the foundation, and restore it.

## Scope

- Server-only database package and explicit PostgreSQL configuration.
- Ordered, transactional, advisory-locked migrations and dedicated ledger.
- Purpose-separated empty schemas for future application, restricted, audit,
  and system records.
- Deterministic non-personal reference fixtures and installation provenance.
- Production refusal, explicit staging approval, and parameterized writes.
- Disposable PostgreSQL integration smoke in local development and CI.

## Non-goals

- Applicant, person, campaign, consent, profile, matchmaking, AI, or audit-event
  business tables.
- ORM/query-builder selection.
- PostGIS or vector extensions before their policy tickets.
- Production roles, managed credentials, backups, or singleton deployment.
- Realistic personal data, copied production data, or provider payloads.

## Acceptance criteria

- [x] A fresh pinned PostgreSQL instance migrates up from zero.
- [x] Migration history is isolated and concurrent runs fail closed.
- [x] Application, restricted, audit, and system schemas are explicit.
- [x] Seed data is deterministic, idempotent, checksummed, and non-personal.
- [x] Production seeding is impossible and staging requires explicit approval.
- [x] Missing or malformed database configuration fails safely.
- [x] One migration can reverse and reapply without drift.
- [x] Root verification and disposable database integration smoke pass in CI.
- [x] Intended changes are committed and reviewed in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: Internal reference values and synthetic fixture metadata only.
- Data-flow changes: Local/CI processes connect to disposable PostgreSQL.
- Roles/permissions: Local owner role only; production least privilege is
  deferred to ARG-106/ARG-113.
- Consent/retention: No personal data or consent-bearing data.
- Deletion/revocation effects: Disposable test database is removed after smoke.
- Threats/abuse: Wrong-target migration, concurrent migration, production
  seeding, credential logging, and fixture contamination.
- AI level and review: No AI.
- Accessibility: No user-interface change.
- Logging/redaction: Connection strings and credentials are never logged.

## Implementation checklist

- [x] Confirm dependencies and decision boundary.
- [x] Document migration and fixture ADR.
- [x] Implement server-only migration runner and initial schemas.
- [x] Implement deterministic guarded fixtures.
- [x] Add positive, negative, idempotency, reversal, and integration tests.
- [x] Add CI database smoke.
- [x] Update contracts, docs, decisions, risks, and delivery evidence.

## Verification evidence

- [x] Focused tests: 16 database unit tests and 5 real-PostgreSQL integration
  tests pass.
- [x] Static/quality checks: TypeScript typecheck, build, repository formatting,
  Actionlint `1.7.12`, Compose validation, and `git diff --check` pass.
- [x] Security/privacy checks: Full dependency audit is clean; malformed or
  absent database configuration, production seeding, unapproved staging
  seeding, fixture-version mutation, and concurrent migration are rejected.
- [x] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: `pnpm verify` and `pnpm db:smoke` pass locally
  against the pinned PostgreSQL `18.3` image.
- [x] Rollout/rollback evidence: Integration smoke proves zero-to-up,
  idempotent seed, one-step down, and re-up. Production orchestration remains
  explicitly deferred to ARG-113.

## Delivery evidence

- Branch: `ticket/ARG-107-data-foundation`
- Commit: `471c103b4a5a93f5c5053aadfb61ba32c9b058db`
- PR: [#13](https://github.com/carlwelchdesign/matchmaker-ai/pull/13)
- Merge: `0777e97b53dd2aaee6e5f88e8114930a46ed0225`
- Deployment: Local/CI database foundation only
- Evidence URLs/paths:
  [Quality](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30070504571),
  [Security](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30070504527),
  [Secret scan](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30070504528),
  [Container security](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30070504526)
- Completion date: 2026-07-23

## Completion notes

Business tables remain gated by their lifecycle, authorization, privacy,
consent, and feature tickets.

- Follow-up owner: ARG-106, ARG-109, ARG-112, ARG-113, and domain tickets
