# ARG-033 — Reconcile delivery plan and Git baseline

- **Epic:** Planning governance
- **Priority:** P0
- **Status:** In progress
- **Named owner:** Carl Welch
- **Named approver/reviewer:** Carl Welch
- **Target milestone:** Decision gate
- **Estimate band:** S
- **Dependencies:** ARG-029
- **Decision/risk links:** R-020
- **Blocked reason/review date:** None

## Outcome

One truthful delivery plan and recoverable clean baseline before product development. Carl explicitly requested this scope on September 6, 2026.

## Scope

Implement [the delivery reset](../recovery-plan-2026-09-06.md): reconcile existing Asana tickets, source/PR manifest, preserve untracked work, resolve stale/duplicate branch metadata, prepare release-first governance and verification evidence.

## Non-goals

No new product features, wholesale advanced-branch merge, business approval, participant activity, real data, vendor activation/spend or production deployment. No deletion of unique source or user artifacts.

## Acceptance criteria

- [x] Owned decision dates and explicit fallback/approval gates map review recommendations to existing Asana work.
- [x] Sole active Asana parent is `1218225587973356`; repository snapshot records it.
- [x] Main, retained synthetic branch and audit PR are distinguished by source SHA and maturity.
- [x] User artifacts have named recoverable stash/tag; divergent local audit history is preserved.
- [ ] Duplicate/stale PR dispositions and branch-control evidence recorded.
- [ ] Locked baseline verification and release/PR handoff recorded.
- [ ] Required merge/promotion authority resolved; exact clean main SHA verified.

## Security, privacy, AI, data, and accessibility

No data-flow or product changes. Private local artifacts stay out of GitHub. Existing research controls remain Closed. AI offload is bounded, read-only and text-only; final source verification remains direct. Accessibility changes are planned, not claimed implemented.

## Verification evidence

- Locked dependency install: Node 24.18.0, pnpm 10.34.5; successful September 6.
- Planning, formatting, typecheck, tests/build and relevant CI: pending final record.
- Local-AI task `argent-baseline-plan-20260906`: generation timeout; no content or cloud fallback. Not used as evidence.

## Delivery evidence

- Branch: `planning/ARG-033-baseline-reconciliation`
- Commit/PR/release: pending verification.
- Deployment: not authorized or performed.
- Asana: https://app.asana.com/1/9789386902387/project/1217038055360286/task/1218225587973356

## Completion notes

Keep incomplete until required integration and verification evidence exists. Follow-on operational repository controls remain ARG-100; selected retained capability integration has its own Asana subtask and gates.
