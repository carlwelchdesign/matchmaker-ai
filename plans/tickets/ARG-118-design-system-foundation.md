# ARG-118 — Cross-platform design system foundation

- **Epic:** Design system
- **Capability/requirement IDs:** ARG-118
- **Priority:** P0
- **Status:** In review
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** M
- **Dependencies:** ARG-004, ARG-101
- **Decision/risk links:** DEC-005, DEC-011, R-037
- **Blocked reason/review date:** ARG-004 final approval remains pending; Nocturne `02` is selected provisionally and is sufficient for foundational token implementation.

## Outcome

Argent has one human-readable Nocturne token source that generates web and Flutter adapters, so public web, staff web, iOS, and Android can share the same brand decisions without hand-copying color, spacing, typography, and component values.

## Scope

- Create a canonical Nocturne token source in `packages/design-system`.
- Generate a web CSS adapter and a Flutter Dart adapter from the canonical token source.
- Wire the current web foundation page to generated CSS variables.
- Wire the current Flutter foundation screen to generated Dart tokens.
- Add focused tests that verify token resolution, generated artifacts, and platform usage.
- Document the generated-file workflow.

## Non-goals

- Final approval of ARG-004 brand direction.
- Public campaign pages, application forms, staff workflow screens, or mobile member workflows.
- Figma library generation.
- Token support for multiple brands or partner campaign overrides.
- AI, matching, authentication, or authorization behavior.

## Acceptance criteria

- [x] Canonical Nocturne tokens are human-readable and organized by primitive, semantic, component, and layout roles.
- [x] Generated web CSS exposes semantic and component variables for application code.
- [x] Generated Dart exposes typed constants usable by Flutter themes.
- [x] Web and Flutter foundation screens consume generated adapters rather than hard-coded Nocturne values.
- [x] Tests fail if generated web or Dart adapters drift from canonical tokens.
- [x] Documentation explains how to edit tokens and regenerate adapters.

## Security, privacy, AI, data, and accessibility

- Data classes: No user data or operational data.
- Data-flow changes: None.
- Roles/permissions: None.
- Consent/retention: None.
- Deletion/revocation effects: None.
- Threats/abuse: Avoids unreviewed theme drift that could weaken focus, contrast, or trust cues.
- AI level and review: None.
- Accessibility: Tokens include contrast-conscious foreground/background, focus, motion, and sizing roles; full accessibility verification remains in ARG-801.
- Logging/redaction: None.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design.
- [x] Implement the smallest coherent change.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads.
- [x] Update contracts, docs, decisions, risks, and runbooks.
- [x] Define rollout, feature-flag, migration, rollback, and recovery behavior.

## Verification evidence

- [x] Focused tests: `pnpm --filter @argent/design-system test`; Flutter widget test verifies theme token usage.
- [x] Static/quality checks: `pnpm check`; `pnpm --filter @argent/web build`.
- [x] Security/privacy checks: No user data, secrets, providers, logs, or permissions changed.
- [x] Accessibility/visual checks: Token roles include foreground, background, border, focus, and motion values; full contrast and responsive QA remains in ARG-801.
- [x] Runtime/deployment checks: Local web app returned `200 OK` at `http://localhost:3000`.
- [x] Rollout/rollback evidence: No migration or feature flag required; rollback is reverting generated token adoption and the design-system package changes.

## Delivery evidence

- Branch: `ticket/ARG-118-design-system-foundation`
- Commit: branch HEAD, `ARG-118: establish design token foundation`
- PR: <https://github.com/carlwelchdesign/matchmaker-ai/pull/27>
- Merge:
- Deployment:
- Evidence URLs/paths:
- Completion date:

## Completion notes

- Follow-up owner: Project owner for ARG-004 approval and ARG-801 accessibility verification.
