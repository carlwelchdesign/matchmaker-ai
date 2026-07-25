# ARG-121 — Build a synthetic Candidate Discovery Map

- **Epic:** Product prototype
- **Capability/requirement IDs:** CAP-003; CAP-009
- **Priority:** P1
- **Status:** In review
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Prototype review
- **Estimate band:** S
- **Dependencies:** ARG-120; DEC-012; DEC-019
- **Decision/risk links:** DEC-012; DEC-019; R-003; R-005; R-033; R-038; R-042
- **Blocked reason/review date:** None; this is a synthetic design review artifact only.

## Outcome

Let the owner review a private, client-centered Candidate Discovery Map in the
separate admin concept without implying that a visual distance, score, or model
can determine the correct introduction.

## Scope

- Add a `Discovery map` view to `apps/admin` using only named fictional
  records and local interaction state.
- Center a fictional client engagement and show a small set of fictional
  candidate nodes with readable status, evidence, unknowns, concerns, and
  matchmaker-shortlist context.
- Let the reviewer select a node and inspect a plain-language, bidirectional
  evidence briefing.
- Make visual clustering a way to explore the synthetic set, not a ranking or
  compatibility claim.
- Record the external-network/API clarification as a future opt-in B2B
  integration boundary with no implementation in this ticket.

## Non-goals

- Accounts, authorization, persistence, API calls, database writes, model
  calls, profile import/export, provider integration, or real candidate data.
- Compatibility scores, closest-node ranking, likelihood/desirability
  predictions, automated recommendations, or introductions.
- Any implementation of a partner, affiliate, licensed-workspace, registry, or
  CRM connector.

## Acceptance criteria

- [x] The separate admin has an accessible `Discovery map` view with obvious
  local-only/synthetic labeling.
- [x] A selected fictional candidate shows passed, review-needed, and unknown items in
  both directions, plus source/freshness and human shortlist context.
- [x] The visual does not encode a numeric compatibility score or describe
  node proximity as correctness.
- [x] The UI states that a matchmaker—not the map—decides whether to shortlist
  or seek an introduction.
- [x] Tests assert no network/storage/form behavior and preserve the
  non-decisional language.
- [x] Partner-network/API planning records require a future provider, terms,
  consent, security, authorization, audit, revocation, and manual-fallback
  review before integration work.

## Security, privacy, AI, data, and accessibility

- Data classes: Hard-coded fictional display data only.
- Data-flow changes: None; no network request, persistence, export, or real
  profile input is introduced.
- Roles/permissions: The separate admin visually represents staff work only;
  it grants no access.
- Consent/retention: None; refresh clears selection state.
- Deletion/revocation effects: None; no data is stored or shared.
- Threats/abuse: A discovery visual must not become a hidden score, be
  mistaken for live personal data, or imply cross-network access.
- AI level and review: None; no AI or ranking behavior is implemented.
- Accessibility: Semantic headings, keyboard-operable candidate controls,
  non-color-only status labels, responsive reflow, and visible focus.
- Logging/redaction: No analytics, logging, or user payloads.

## Implementation checklist

- [x] Confirm the synthetic-only boundary and external-network decision.
- [x] Confirm no API/data/permission behavior is introduced.
- [x] Implement the smallest coherent private discovery-map concept.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads; intentionally none because
  this concept makes no network, storage, or consequential action.
- [x] Update contracts, docs, decisions, risks, and runbooks; planning now
  records the external-network boundary and risk.
- [x] Define rollout, feature-flag, migration, rollback, and recovery
  behavior; local-only, no migration/flag, refresh resets interaction state,
  rollback is a revert.

## Verification evidence

- [x] Focused tests: `pnpm --filter @argent/admin test` confirms the separate
  admin retains synthetic/disconnected language and no fetch, storage, or form
  behavior.
- [x] Static/quality checks: `pnpm --filter @argent/admin typecheck`; `pnpm
  --filter @argent/admin build`; `pnpm plans:check`; `pnpm format:check`; and
  `git diff --check` pass.
- [x] Security/privacy checks: source test confirms no `fetch`, `localStorage`,
  or HTML form; the map uses hard-coded fictional records only.
- [x] Accessibility/visual checks: keyboard-operable buttons expose pressed
  state; selected candidate briefing uses semantic headings/lists and named
  regions; responsive map reflows into a linear reading order; desktop local
  preview visually reviewed.
- [x] Runtime/deployment checks: `http://localhost:3003` local Next.js preview
  opens the map, selects Noor Sable, updates the pressed state and evidence
  briefing, and reports no browser-console errors.
- [x] Rollout/rollback evidence: local-only concept; refresh resets selection
  state; no migration/flag; reverting this ticket removes the map and planning
  clarification.

## Delivery evidence

- Branch: `codex/ARG-121-candidate-discovery-map`
- Commit: `b0d7b85` (`ARG-121 add synthetic candidate discovery map`)
- PR: https://github.com/carlwelchdesign/matchmaker-ai/pull/43
- Merge:
- Deployment: Local Docker concept prototype only
- Evidence URLs/paths:
- Completion date:

## Completion notes

This ticket is a visual and interaction prototype for private matchmaker
judgment. It does not advance the research gates for matching logic or create
an external-network integration.

- Follow-up owner: ARG-008; ARG-502; ARG-503; ARG-505; ADR-021
