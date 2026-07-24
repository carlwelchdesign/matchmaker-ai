# ARG-002 — Founder and matchmaker workflow research

- **Epic:** Research
- **Capability/requirement IDs:** CAP-001; CAP-003; CAP-004
- **Priority:** P0
- **Status:** Ready
- **Named owner:** Project owner
- **Named approver/reviewer:** Project owner
- **Target milestone:** Decision gate
- **Estimate band:** M
- **Dependencies:** ARG-001
- **Decision/risk links:** R-016; R-023; R-040
- **Blocked reason/review date:** Ready for founder/operator and matchmaker
  research execution.

## Outcome

Document how Argent's founder/operator and practicing matchmakers actually work
so lifecycle, service blueprint, staffing, review queue, and matchmaking
workflow decisions are based on evidence rather than dating-app assumptions.

## Scope

- Use [ARG-002 research protocol](../research/ARG-002-founder-matchmaker-workflow.md).
- Use the shared research operations runbook, participant screener, consent
  script, session-note template, and synthesis tracker.
- Use the ARG-002 moderator guide for founder/operator, matchmaker/operator,
  and case-walkthrough sessions.
- Conduct founder/operator workflow interview.
- Conduct at least two matchmaker or equivalent high-touch service workflow
  interviews.
- Walk through five recent or synthetic cases from lead/application to outcome.
- Synthesize decision points, required information, human/system
  responsibilities, and unresolved policy issues.
- Update downstream planning documents and tickets with the findings.

## Non-goals

- Building workflow software.
- Collecting real applicant/client personal data in planning files.
- Approving lifecycle policies owned by `ARG-005`, `ARG-013`, or `ARG-014`.
- Approving staffing capacity or service-level commitments owned by `ARG-011`
  and `ARG-012`.
- Approving AI matching behavior.

## Acceptance criteria

- [ ] Founder/operator interview is documented with sensitive details redacted.
- [ ] At least two matchmaker/operator interviews are documented or a gap and
  fallback are explicitly approved.
- [ ] Five case walkthroughs are synthesized.
- [ ] Findings separate evidence, inference, and unresolved assumptions.
- [ ] Human-versus-system responsibilities are mapped.
- [ ] Downstream impacts are recorded for `ARG-005`, `ARG-011`, `ARG-012`,
  `ARG-026`, `ARG-401`, `ARG-406`, `ARG-501`, and `ARG-505`.
- [ ] Privacy and sensitive-data handling are reviewed before real participant
  notes are stored.
- [x] Run-ready screener, consent script, note template, and synthesis tracker
  exist.
- [x] Moderator guide exists for required session types.

## Security, privacy, AI, data, and accessibility

- Data classes: Research planning notes; possible operational examples if
  redacted and approved.
- Data-flow changes: None until implementation tickets.
- Roles/permissions: Research access is limited to project owner/researcher.
- Consent/retention: Real interviews require consent to notes and separate
  consent for recording or transcription.
- Deletion/revocation effects: Research notes must be removable if a participant
  withdraws consent.
- Threats/abuse: Avoid recording unnecessary intimate, financial, identity,
  safety, or third-party details.
- AI level and review: AI may summarize redacted notes only after source-data
  handling is approved; no automated workflow decisions.
- Accessibility: Interview protocol should ask about alternate communication
  and accessibility needs for applicants, clients, and staff.
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
  planning notes and requires consent for real interviews.
- [x] Accessibility/visual checks: Protocol includes accessibility prompts; no
  UI change.
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
  - [ARG-002 research protocol](../research/ARG-002-founder-matchmaker-workflow.md)
  - [Research operations runbook](../research/research-operations-runbook.md)
  - [Participant screener](../research/participant-screener.md)
  - [Consent and session script](../research/consent-and-session-script.md)
  - [Synthesis tracker](../research/research-synthesis-tracker.md)
  - [ARG-002 moderator guide](../research/session-materials/ARG-002-moderator-guide.md)
- Completion date:

## Completion notes

This ticket is `Ready`, not `Done`. It requires real founder/matchmaker
research evidence before lifecycle or matchmaking implementation can start.

- Follow-up owner: Project owner
