# ARG-000 — Establish planning and delivery foundation

- **Epic:** Planning and governance
- **Priority:** P0
- **Status:** In review
- **Owner:** Codex
- **Reviewer:** Project owner
- **Dependencies:** None
- **Decision/risk links:** DEC-001 through DEC-011, R-020, R-037

## Outcome

Create a version-controlled, decision-ready planning package that defines Argent's product direction, private-beta scope, experience, architecture, trust requirements, delivery workflow, risks, and implementation backlog.

## Scope

- Initialize the repository and a dedicated planning branch.
- Create the canonical `/plans` structure.
- Create phased tickets and completion checklists.
- Run specialist reviews across product, architecture, AI, content, trust, monetization, UX, data, documentation, and delivery.
- Integrate review findings and validate traceability.

## Non-goals

- Scaffold or implement the application.
- Select providers without evidence.
- Open or merge a PR without a configured remote and review target.

## Acceptance criteria

- [x] Repository initialized on `main`.
- [x] Dedicated `planning/foundation` branch created.
- [x] Canonical product, scope, experience, architecture, data, security/privacy, AI, operations, delivery, risks, and decision files created.
- [x] Backlog and master checklist created.
- [x] All ten specialist review lenses completed.
- [x] Material findings integrated into canonical plans and tickets.
- [x] Planning validation checklist completed.
- [x] Markdown/CSV/link hygiene checks pass.
- [x] Intended planning files committed with ticket ID.
- [x] PR opened or exact remote/auth prerequisite recorded.
- [x] Merge completed or intentionally left for owner review.

## Verification evidence

- Branch: `planning/foundation`
- Commit: `6582ef7` (`ARG-000: establish Argent planning foundation`)
- PR: [#1 — ARG-000 — Establish Argent planning foundation](https://github.com/carlwelchdesign/matchmaker-ai/pull/1) (`draft`, clean, mergeable)
- Merge: Intentionally pending project-owner review
