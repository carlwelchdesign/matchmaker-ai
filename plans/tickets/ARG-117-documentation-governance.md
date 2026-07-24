# ARG-117 — Documentation governance and drift checks

- **Epic:** Documentation
- **Capability/requirement IDs:** CAP-007
- **Priority:** P0
- **Status:** Done
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** S
- **Dependencies:** ARG-104
- **Decision/risk links:** R-020
- **Blocked reason/review date:** Full requirement traceability remains owned by ARG-024; this slice implements backlog, ticket, checklist, and local-link drift checks only.

## Outcome

The planning package has an automated drift check in the local and CI quality path, preventing common planning errors from silently landing as delivery work accelerates.

## Scope

- Add a planning validator for backlog schema, ticket IDs, dependency integrity, dependency cycles, ticket-file status drift, backlog checklist coverage, and local Markdown links.
- Add focused tests for the validator's CSV, dependency, cycle, and ticket-status parsing behavior.
- Wire the validator into the existing CI policy check.
- Record completed ARG-118 merge evidence and checklist status.

## Non-goals

- Full capability-to-ticket traceability enforcement.
- Issue tracker integration.
- External-link checking.
- Release-note or runbook ownership enforcement.
- Product, legal, AI, or security policy approval.

## Acceptance criteria

- [x] `pnpm plans:check` validates planning structure and fails on representative malformed inputs.
- [x] `pnpm ci:check` runs the planning validator.
- [x] Backlog CSV, ticket files, backlog checklist, and local Markdown links are checked for drift.
- [x] ARG-118 merged state is reflected in ticket, backlog, and master checklist evidence.
- [x] Documentation governance explains the automated checks and remaining ARG-024 boundary.

## Security, privacy, AI, data, and accessibility

- Data classes: Planning files, local repository metadata, and test fixtures only.
- Data-flow changes: None outside local/CI repository checks.
- Roles/permissions: None.
- Consent/retention: None.
- Deletion/revocation effects: None.
- Threats/abuse: Reduces stale planning, missing evidence, and accidental implementation outside documented gates.
- AI level and review: None.
- Accessibility: No UI change.
- Logging/redaction: Validator prints only file paths and ticket IDs, not secrets or user data.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design.
- [x] Implement the smallest coherent change.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads.
- [x] Update contracts, docs, decisions, risks, and runbooks.
- [x] Define rollout, feature-flag, migration, rollback, and recovery behavior.

## Verification evidence

- [x] Focused tests: `pnpm plans:check` runs `node --test scripts/validate-plans.test.mjs` and validates the live planning package.
- [x] Static/quality checks: `pnpm ci:check`; `pnpm check`.
- [x] Security/privacy checks: No secrets, user data, providers, logs, permissions, or production data paths changed.
- [x] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: Not applicable; planning/CI validation only.
- [x] Rollout/rollback evidence: Additive CI validation; rollback is removing `plans:check` from `ci:check` and reverting the validator files.

## Delivery evidence

- Branch: `ticket/ARG-117-documentation-drift-checks`
- Commit:
- PR: <https://github.com/carlwelchdesign/matchmaker-ai/pull/28>
- Merge: `5467f3f` on 2026-07-24
- Deployment:
- Evidence URLs/paths:
  - [PR #28 checks](https://github.com/carlwelchdesign/matchmaker-ai/pull/28/checks)
- Completion date:
  2026-07-24

## Completion notes

- Follow-up owner: ARG-024 for full capability, risk, decision, and evidence traceability.
