# ARG-119 — Backlog readiness report

- **Epic:** Planning
- **Capability/requirement IDs:** CAP-007
- **Priority:** P0
- **Status:** In review
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** S
- **Dependencies:** ARG-117
- **Decision/risk links:** R-020
- **Blocked reason/review date:** None.

## Outcome

The repository can report which tickets are safe for implementation and which tickets are dependency-ready but still decision-gated before development starts.

## Scope

- Add a local backlog readiness report command.
- Separate implementation-ready tickets from decision-ready or gated tickets.
- Show dependency-blocked tickets and their missing dependencies.
- Add focused tests for readiness classification and report formatting.
- Wire the report tests into planning validation.

## Non-goals

- Approving gated product, privacy, security, AI, architecture, or launch decisions.
- Changing branch protection or GitHub repository settings.
- Replacing full ARG-024 requirement-to-delivery traceability.

## Acceptance criteria

- [x] `pnpm plans:next` prints an operator-readable backlog readiness report.
- [x] The report distinguishes dependency-ready decision work from safe implementation work.
- [x] The report lists unfinished dependencies for blocked tickets.
- [x] `pnpm plans:check` runs report tests.
- [x] PR checks pass before merge.

## Security, privacy, AI, data, and accessibility

- Data classes: Planning metadata only.
- Data-flow changes: None outside local/CI repository checks.
- Roles/permissions: None.
- Consent/retention: None.
- Deletion/revocation effects: None.
- Threats/abuse: Reduces accidental implementation of gated work.
- AI level and review: None.
- Accessibility: No UI change.
- Logging/redaction: Report prints only ticket metadata from the repository.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design.
- [x] Implement the smallest coherent change.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads.
- [x] Update contracts, docs, decisions, risks, and runbooks.
- [x] Define rollout, feature-flag, migration, rollback, and recovery behavior.

## Verification evidence

- [x] Focused tests: `pnpm plans:check`; `pnpm plans:next`.
- [x] Static/quality checks: `pnpm format:check`; `pnpm ci:check`; `git diff --check`; PR #30 checks.
- [x] Security/privacy checks: No secrets, user data, providers, logs, permissions, or production data paths changed.
- [x] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: Not applicable; planning report only.
- [x] Rollout/rollback evidence: Additive local command; rollback is removing `plans:next`, the report script, and its test.

## Delivery evidence

- Branch: `ticket/ARG-119-backlog-readiness-report`
- Commit: `4f1911a`
- PR: <https://github.com/carlwelchdesign/matchmaker-ai/pull/30>
- Merge:
- Deployment:
- Evidence URLs/paths:
  - [PR #30 checks](https://github.com/carlwelchdesign/matchmaker-ai/pull/30/checks)
- Completion date:
