# ARG-120 — Build a synthetic, interactive concept prototype

- **Epic:** Product prototype
- **Capability/requirement IDs:** CAP-001; CAP-003; CAP-004
- **Priority:** P0
- **Status:** In progress
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Prototype review
- **Estimate band:** M
- **Dependencies:** ARG-101; ARG-118
- **Decision/risk links:** DEC-011; DEC-012; DEC-013; DEC-014; R-025; R-038; R-039; R-040
- **Blocked reason/review date:** None; explicit project-owner authorization on 2026-07-24 for a non-production concept prototype.

## Outcome

Give the project owner a local, interactive Nocturne prototype of Argent's
public campaign/application path, applicant status moment, and matchmaker
workspace without collecting, processing, or presenting real personal data.

## Scope

- Build a Nocturne public splash screen, public campaign/application prototype,
  and separate synthetic operational admin route with fictional data.
- Include a public campaign landing view, a reviewable application path, a
  submission/status moment, and an operational matchmaker workspace view.
- Add a Flutter concept screen that demonstrates the same applicant-facing
  campaign/application posture using the shared Nocturne tokens.
- Keep all interactions client-local and reversible on refresh.
- Make prototype mode unmistakable in the UI and documentation.

## Non-goals

- Accounts, authentication, authorization, persistence, APIs, database writes,
  analytics, cookies, email, payments, Stripe, invitations, or geolocation.
- Real applications, profiles, photos, campaign partners, people, or matching.
- Admission, verification, ranking, recommendation, AI, conversational/voice
  intake, or an introduction workflow.
- A production launch, usability claim, or substitute for ARG-002/ARG-003.

## Acceptance criteria

- [x] Public web view communicates a bounded first campaign without treating Santa Barbara as Argent's permanent market boundary.
- [x] Public root uses the Nocturne public splash composition and does not expose operational navigation.
- [x] Web application path has clear synthetic/demo and non-submission behavior.
- [x] Web operational view demonstrates human-led review and candidate discovery without scores or match claims.
- [x] Jenny's operational concept is isolated at `/admin`, separate from the public/member experience.
- [x] Flutter screen uses the shared token adapter and represents the same prototype boundary.
- [x] All sample records are fictional and contain no personal or sensitive data.
- [x] Keyboard, focus, responsive, reduced-motion, and non-production states are represented proportionately; no asynchronous data action exists, so loading/error recovery is not simulated.
- [x] Tests prove prototype data is local/synthetic and the public flow does not submit information.
- [x] The local Docker stack and Flutter test path are verified.

## Security, privacy, AI, data, and accessibility

- Data classes: Hard-coded fictional display data only.
- Data-flow changes: None; no network request or persistence is introduced.
- Roles/permissions: Screens simulate roles visually; they grant no access.
- Consent/retention: None; refresh clears all interaction state.
- Deletion/revocation effects: None; no data is stored.
- Threats/abuse: The interface must not be mistaken for a live application or used to collect personal information.
- AI level and review: None; no AI language or compatibility behavior.
- Accessibility: Semantic headings, visible focus, keyboard controls, text reflow, contrast-conscious tokens, and motion reduction.
- Logging/redaction: No analytics, logging, or user payloads.

## Implementation checklist

- [x] Confirm dependencies and prototype-only decision.
- [x] Confirm no API/data/permission behavior is introduced.
- [x] Implement the smallest coherent cross-platform prototype.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads; intentionally none because the prototype makes no network, storage, or consequential action.
- [x] Update contracts, docs, decisions, risks, and runbooks; no contract, risk, or runbook change is needed because no system boundary changed.
- [x] Define rollout, feature-flag, migration, rollback, and recovery behavior; local-only, no migration/flag, refresh resets interaction state, rollback is a revert.

## Verification evidence

- [x] Focused tests: `pnpm --filter @argent/web test`; `flutter test`.
- [x] Static/quality checks: `pnpm format:check`; `pnpm --filter @argent/web typecheck`; `pnpm --filter @argent/web build`; `flutter analyze`; `pnpm plans:check`; `git diff --check`.
- [x] Security/privacy checks: static test asserts no `fetch`, `localStorage`, or HTML form in the interactive prototype; no API, persistence, analytics, or real data changed.
- [x] Accessibility/visual checks: semantic headings, visible focus, responsive CSS, reduced-motion rule, and local Docker web runtime verified at `http://localhost:3000`.
- [x] Runtime/deployment checks: Docker web, API, worker, PostgreSQL, and Redis started locally on 2026-07-24; Argent PostgreSQL is isolated on localhost port 5434 because port 5432 is already in use by another local service.
- [x] Rollout/rollback evidence: local Docker review only; refresh clears browser interaction state; reverting this ticket restores the foundation screen.

## Delivery evidence

- Branch: `ticket/ARG-120-synthetic-concept-prototype`
- Commit: branch HEAD (`ARG-120 build synthetic concept prototype`)
- PR:
- Merge:
- Deployment: Local Docker concept prototype only
- Evidence URLs/paths:
- Completion date:

## Completion notes

This ticket intentionally creates a review artifact, not a pathway to collect
real data or bypass ARG-002/ARG-003, privacy, lifecycle, matching, or launch
gates.

- Follow-up owner: Project owner
