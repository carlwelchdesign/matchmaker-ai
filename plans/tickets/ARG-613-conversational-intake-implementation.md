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
- [x] The first local slice supports one question at a time, pause/resume,
  mode switching, skip, source editing, and field-by-field approval or exclusion.
- [x] Keep-private and reject remain separate candidate decisions, and the final
  candidate-visible review shows the exact source revision and disposition.
- [x] A validated `candidate-interview-review/v1` domain projection marks only
  approved, source-exact fields eligible for later profile use or analytics.
- [x] The local slice makes no provider call and stores or submits no response.
- [x] The guide and grounded follow-up behavior are deterministic and tested.
- [ ] Approved persistence stores source, proposal, approval, provenance, and
  version data through the ARG-615 contract.
- [ ] Provider-backed adaptive generation passes ARG-607, ARG-608, and ARG-611.
- [ ] Accessibility, privacy, counsel, and approved-user-research gates pass.
- [ ] Voice remains separately gated until ARG-028 and ADR-020 are approved.

## Current development increment

- Branch: `codex/ARG-613-text-interview`
- Initial interview commit: `96e8c61`
- Candidate-controlled final-review commit: `c43febf`
- Surface: existing `/prototype` Application flow only
- Flag: `candidate-interviewing`
- Runtime boundary: local page state only; no database, provider, transcript,
  audio, telemetry content, or personal-data handling
- Review boundary: approved, private, rejected, and declined states remain
  distinct; every displayed field cites its exact response revision
- Verification: 9 domain tests, 10 web tests, domain/web TypeScript, production
  build, planning validation, formatting, Docker, and full browser review path
- Deployment: none; local review only

## Next increment

Define and implement the ARG-615 candidate-record and provenance contract before
adding persistence or a model provider. Keep the approved source-edit and
field-disposition controls as the write boundary.
