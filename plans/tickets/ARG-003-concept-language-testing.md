# ARG-003 — Applicant, candidate, and client concept language testing

- **Epic:** Research
- **Capability/requirement IDs:** CAP-001; CAP-002; CAP-004; CAP-009
- **Priority:** P0
- **Status:** Ready
- **Named owner:** Project owner
- **Named approver/reviewer:** Project owner
- **Target milestone:** Decision gate
- **Estimate band:** M
- **Dependencies:** ARG-001
- **Decision/risk links:** R-004; R-025; R-038; R-039; R-040
- **Blocked reason/review date:** Ready for concept/language research
  execution.

## Outcome

Validate that Argent's applicant, candidate, client, campaign, status, and
AI-assistance language is clear, premium, respectful, privacy-preserving, and
not misleading before public pages, intake, brand claims, or conversational
flows are built.

## Scope

- Use [ARG-003 testing protocol](../research/ARG-003-concept-language-testing.md).
- Use the shared research operations runbook, participant screener, consent
  script, session-note template, and synthesis tracker.
- Use the ARG-003 moderator guide and low-fidelity concept stimuli.
- Test public application, local campaign, intake-mode choice, and status/outcome
  language.
- Include applicant/candidate, potential client, founder/operator, and
  accessibility-oriented review perspectives.
- Identify approved, revised, escalated, and prohibited language.
- Update downstream brand, consent, campaign, application, match-science, and
  conversational-intake plans.

## Non-goals

- Final campaign copy.
- Final legal notices or privacy policy.
- UI implementation.
- Voice or conversational-intake implementation.
- Claims that AI predicts compatibility, chemistry, honesty, personality, or
  relationship success.

## Acceptance criteria

- [ ] At least three applicant/candidate concept reviews are documented.
- [ ] At least two potential paying-client concept reviews are documented.
- [ ] Founder/operator copy review is documented.
- [ ] Accessibility-oriented review is documented.
- [ ] Findings classify language as approved, needs revision, policy escalation,
  or prohibited.
- [ ] Downstream impacts are recorded for `ARG-004`, `ARG-005`, `ARG-006`,
  `ARG-016`, `ARG-018`, `ARG-026`, and `ARG-027`.
- [ ] No real participant sensitive data is stored in planning files without
  approved consent and redaction.
- [x] Run-ready screener, consent script, note template, and synthesis tracker
  exist.
- [x] Moderator guide and low-fidelity concept stimuli exist.
- [x] Synthetic concept/language dry run is documented; real participant
  evidence is still required before `Done`.
- [x] Private field-research execution packet defines recruitment, session,
  evidence, and gate-review handling; real participant sessions remain required.

## Security, privacy, AI, data, and accessibility

- Data classes: Research planning notes and redacted participant feedback.
- Data-flow changes: None until implementation tickets.
- Roles/permissions: Research access is limited to project owner/researcher.
- Consent/retention: Real participant feedback requires consent to notes and
  separate consent for recording/transcription.
- Deletion/revocation effects: Research notes must be removable if a participant
  withdraws consent.
- Threats/abuse: Avoid language that implies discriminatory eligibility,
  guaranteed safety, pay-to-play ranking, or predictive AI judgments.
- AI level and review: AI may summarize redacted feedback only after handling is
  approved; AI is not a participant evaluator.
- Accessibility: Concepts must be reviewed for reading burden, plain language,
  keyboard/screen-reader implications, and alternate intake needs.
- Logging/redaction: Do not place sensitive research data in logs, tickets, PRs,
  fixtures, or model prompts.

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
- [x] Static/quality checks: `pnpm format:check`; `git diff --check`.
- [x] Security/privacy checks: Protocol prohibits sensitive personal data in
  planning notes and requires consent for real participants.
- [x] Accessibility/visual checks: Protocol includes accessibility-oriented
  concept review; no UI change.
- [x] Runtime/deployment checks: Not applicable; planning/research protocol
  only.
- [x] Rollout/rollback evidence: Additive research protocol; rollback is
  reverting the planning files.

## Delivery evidence

- Branch: `planning/ARG-002-003-research-gates`
- Commit:
- PR:
- Merge:
- Deployment: Planning only
- Evidence URLs/paths:
  - [ARG-003 testing protocol](../research/ARG-003-concept-language-testing.md)
  - [Research operations runbook](../research/research-operations-runbook.md)
  - [Participant screener](../research/participant-screener.md)
  - [Consent and session script](../research/consent-and-session-script.md)
  - [Synthesis tracker](../research/research-synthesis-tracker.md)
  - [ARG-003 moderator guide](../research/session-materials/ARG-003-moderator-guide.md)
  - [ARG-003 concept stimuli](../research/session-materials/ARG-003-concept-stimuli.md)
  - [ARG-003 synthetic concept review](../research/synthetic-dry-runs/ARG-003-synthetic-concept-review.md)
  - [Field research execution packet](../research/field-research-execution-packet.md)
- Completion date:

## Completion notes

This ticket is `Ready`, not `Done`. The synthetic concept review identifies
hypotheses to test but does not replace real applicant/candidate/client,
founder, or accessibility evidence.

- Follow-up owner: Project owner
