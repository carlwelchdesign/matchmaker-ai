# ARG-029 — Delivery-control authority and readiness enforcement

- **Epic:** Planning governance
- **Capability/requirement IDs:** CAP-007
- **Priority:** P0
- **Status:** Done
- **Artifact maturity:** Merged planning control
- **Named owner:** Carl Welch
- **Named approver/reviewer:** Project owner
- **Target milestone:** Decision gate
- **Estimate band:** S
- **Dependencies:** ARG-000; ARG-117
- **Decision/risk links:** R-020
- **Blocked reason/review date:** None
- **Asana task:** `1217966588260345`

## Outcome

Argent's workflow state and next-work report cannot represent unauthorized work
as implementation-ready, while completed planning, research, contract, and
synthetic-prototype evidence remains preserved under an independent maturity
classification.

## Scope

- Make Asana authoritative for operational workflow status and the repository
  authoritative for durable scope, dependencies, acceptance, and evidence.
- Define delivery status independently from artifact maturity.
- Enforce one active parent ticket plus its subtasks.
- Require `Ready`, named ownership/review, dependency completion or a structured
  approved waiver, concrete acceptance evidence, risk/decision linkage, and WIP
  capacity before reporting implementation-ready work.
- Reconcile stale repository `In progress` states against the live board.
- Validate the machine-readable Asana workflow snapshot against the backlog.

## Non-goals

- Replacing ARG-024's full capability, requirement, checklist, and evidence
  traceability scope.
- Calling Asana from CI or storing connector credentials in the repository.
- Relabeling synthetic evidence as integrated, human-validated, or production
  proof.
- Changing product behavior, real data, participant outreach, providers,
  persistence, identity resolution, billing, or production access.

## Acceptance criteria

- [x] Canonical policy names the workflow and evidence authorities and defines
      delivery status separately from artifact maturity.
- [x] Exactly one repository ticket may be `In progress`, matching the active
      ticket in the versioned Asana snapshot.
- [x] `Ready` and `In progress` tickets require assigned owner/reviewer, a
      detailed ticket file, a concrete acceptance artifact, valid estimate, and
      completed dependencies or a structured approved waiver.
- [x] `Blocked` tickets require an assigned owner/reviewer plus reason, review
      date, and fallback.
- [x] Done tickets with unfinished historical dependencies require a dated,
      scoped, named approval waiver.
- [x] The next-work report never labels Proposed, Blocked, In progress, or In
      review work implementation-ready and respects WIP capacity.
- [x] Negative tests cover forbidden status, ownership, evidence, dependency,
      waiver, and WIP states.
- [x] ARG-004, ARG-026, and ARG-027 are reconciled without deleting their
      planning or synthetic evidence.
- [x] Human review is required before merge or completion.

## Security, privacy, AI, data, and accessibility

- Data classes: repository planning metadata and opaque Asana task identifiers.
- Data-flow changes: local/CI validation reads a versioned snapshot; it makes no
  external calls.
- Roles/permissions: workflow transitions remain human-authorized.
- Consent/retention: no participant data.
- Deletion/revocation effects: not applicable.
- Threats/abuse: prevents accidental implementation of gated work and status
  inflation.
- AI level and review: no AI runtime; human PR review required.
- Accessibility: no UI change.
- Logging/redaction: planning report contains no secrets or personal data.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design.
- [x] Implement the smallest coherent change.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads: `plans:next` reports active
      WIP and fail-closed readiness using planning metadata only.
- [x] Update contracts, docs, decisions, risks, and runbooks.
- [x] Define rollout, feature-flag, migration, rollback, and recovery behavior:
      merge only after human review; rollback is reverting the planning-control
      commit and restoring the last reviewed snapshot.

## Verification evidence

- [x] Focused tests: `pnpm plans:check` — 17 tests; 136 backlog rows; 19
      detailed ticket files; dependency graph and local links validated.
- [x] Static/quality checks: `pnpm ci:check`; `pnpm format:check`; `pnpm
      typecheck`; `pnpm test`; `git diff --check`.
- [x] Security/privacy checks: CI policy validation passed across four
      workflows; the change reads repository planning metadata only and stores
      opaque Asana identifiers without credentials or participant data.
- [x] Accessibility/visual checks: not applicable; no UI change.
- [x] Runtime/deployment checks: not applicable; repository planning control.
- [x] Rollout/rollback evidence: additive validation plus reviewable state
      reconciliation; no automatic Asana mutation.

## Delivery evidence

- Branch: `ticket/ARG-029-delivery-control`
- Commit: `bc5eaa9`
- PR: <https://github.com/carlwelchdesign/matchmaker-ai/pull/89>
- Merge: `6e20136` on 2026-08-28
- Deployment: not applicable
- Evidence URLs/paths:
  - Asana task `1217966588260345`
  - [PR #89 checks](https://github.com/carlwelchdesign/matchmaker-ai/pull/89/checks)
  - `plans/delivery-state.json`
  - `scripts/report-next-work.mjs`
  - `scripts/validate-plans.mjs`
- Completion date: 2026-08-28

## Completion notes

The user authorized ticket creation and beginning ARG-029 on 2026-08-28. The
Asana task is assigned to Carl Welch, and all other new audit outcomes remain in
MVP pending human review.

The user approved continuation after all PR checks passed. PR #89 was squash
merged, the Asana task was completed and moved to Complete, and `main` was
synchronized before ARG-030 entered WIP.

- Follow-up owner: Carl Welch
