# ARG-613 — Conversational intake implementation

- **Epic:** Conversational intake
- **Capability/requirement IDs:** CAP-001, CAP-004, CAP-005, CAP-010
- **Priority:** P2
- **Status:** In progress
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned product, privacy, accessibility, and AI reviewers
- **Target milestone:** Private beta
- **Estimate band:** L
- **Dependencies:** ARG-027, ARG-028, ARG-111, ARG-402, ARG-601, ARG-607, ARG-608, ARG-611, ARG-614
- **Decision/risk links:** DEC-013, DEC-020, ADR-020, R-039, R-040, R-043

## Outcome

Applicants can complete an optional, paced text interview within the existing
application experience, correct their source responses, and approve or exclude
each source-grounded field before submission.

## Acceptance criteria

- [x] The interview is gated by `candidate-interviewing` and fails closed.
- [x] Conversation and hybrid entry points remain inside the established
  Application flow; no parallel site or standalone interview route is created.
- [x] The candidate-facing flow extends the approved light Sunrise system and
  Montecito identity; the obsolete dark campaign-prototype shell is not part of
  the interview experience.
- [x] Structured entry presents the complete fixed guide, supports answering in
  any order or declining each question, and uses the same exact-source review
  and final disposition contract as conversation and hybrid.
- [x] The first local slice supports one question at a time, pause/resume,
  mode switching, skip, source editing, and field-by-field approval or exclusion.
- [x] Keep-private and reject remain separate candidate decisions, and the final
  candidate-visible review shows the exact source revision and disposition.
- [x] A validated `candidate-interview-review/v1` domain projection marks only
  approved, source-exact fields eligible for later profile use or analytics.
- [x] The local slice makes no provider call and stores or submits no response.
- [x] The guide and grounded follow-up behavior are deterministic and tested.
- [x] Follow-up selection is transparent: the candidate sees why a question was
  chosen, and arbitrary or declined text falls back to the fixed guide.
- [x] Active interviews own their navigation: future-step shortcuts and the
  generic application CTA cannot bypass the interview accidentally.
- [x] Candidates can explicitly choose another approach, continue without the
  interview, or continue after final review; local page memory survives
  skip/back and completed-review/back navigation.
- [x] Structured, conversation, and hybrid modes provide deterministic local
  clarification, privacy guidance, and a truthful future human-assistance
  boundary without claiming that a handoff occurred.
- [ ] Approved persistence stores source, proposal, approval, provenance, and
  version data through the ARG-615 contract.
- [ ] Provider-backed adaptive generation passes ARG-607, ARG-608, and ARG-611.
- [ ] Accessibility, privacy, counsel, and approved-user-research gates pass.
- [ ] Voice remains separately gated until ARG-028 and ADR-020 are approved.

## Current development increment

- Foundation branch: `codex/ARG-613-text-interview`
- Accessibility hardening branch: `codex/ARG-613-interview-accessibility`
- Initial interview commit: `96e8c61`
- Candidate-controlled final-review commit: `c43febf`
- Explicit navigation and local restoration commit: `c6fcded`
- Structured worksheet and shared review-contract commit: `4c3af04`
- Deterministic interview-assistance commit: `facb39b`
- Sunrise application alignment commit: `1314102`
- Sunrise spacing-rhythm correction commit: `59f7382`
- Interview accessibility hardening commit: `87e3e76`
- The latest accessibility increment gives the Answer style and field-review
  controls explicit group semantics, announces question progress, moves focus
  to newly active question/review/pause/completion headings, moves focus into
  interview help, and returns focus to the help trigger when it closes.
- Surface: existing `/prototype` Application flow only
- Flag: `candidate-interviewing`
- Runtime boundary: local page state only; no database, provider, transcript,
  audio, telemetry content, or personal-data handling
- Review boundary: approved, private, rejected, and declined states remain
  distinct; every displayed field cites its exact response revision
- Verification: the current web suite passes 115 tests across 17 files, web
  TypeScript and production build pass, 140 planning tickets validate,
  formatting and diff hygiene pass, and the enabled local browser path verifies
  help open/close focus, question-transition focus and progress, review-entry
  focus, semantic control groups, and zero console errors
- Runtime evidence: the production-style port-3000 container remains
  fail-closed without an approved flag configuration; the enabled browser check
  used a temporary provider-free development server that was stopped afterward
- Deployment: none; local review only

## Next increment

Integrate only after the ARG-615 persistence, consent, deletion, and role-policy
dependencies are approved. Keep the approved source-edit and field-disposition
controls as the write boundary; do not add a model provider or database write
from this prototype.
