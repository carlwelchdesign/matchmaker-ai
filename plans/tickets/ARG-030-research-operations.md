# ARG-030 — Fail-closed human-research authorization framework

- **Epic:** Research governance
- **Capability/requirement IDs:** CAP-001, CAP-004, CAP-007, CAP-010
- **Priority:** P0
- **Status:** Done
- **Artifact maturity:** Approved closed research-governance framework
- **Named owner:** Carl Welch
- **Named approver/reviewer:** Project owner for framework delivery;
  privacy/trust reviewer required before participant activity
- **Target milestone:** Decision gate
- **Estimate band:** S
- **Dependencies:** ARG-029
- **Decision/risk links:** R-002, R-025, R-039, R-040
- **Blocked reason/review date:** None
- **Asana task:** `1217966825442195`

## Outcome

No human-research outreach or session can begin until a shared, reviewable
authorization record proves that recruitment, participant records, consent,
incentives, accessibility, data handling, withdrawal, and safety escalation are
owned and approved for the specific protocol.

## Scope

- Define one fail-closed authorization state for ARG-002 and ARG-003 that later
  protocols, including ARG-031 and representative implementation research, must
  register with before participant contact.
- Define the participant system-of-record decision, research-data inventory,
  access, storage, redaction, retention/deletion, and incident expectations.
- Add an opaque consent-receipt template that must not contain direct personal
  data in the repository.
- Define recruitment-channel, incentive, participant-communication,
  accessibility, withdrawal, and safety-escalation controls.
- Make planning validation reject an internally inconsistent authorization.

## Non-goals

- Selecting a participant system, communication channel, storage provider, or
  incentive mechanism without human/privacy approval.
- Authorizing outreach, scheduling, recording, transcription, real applicant
  data, production access, or product enrollment.
- Replacing protocol-specific approval, consent, or professional legal/privacy
  review.
- Storing names, contact details, recordings, transcripts, or incentive/payment
  data in the repository.

## Acceptance criteria

- [x] A machine-readable authorization record defaults to no outreach and no
      recording.
- [x] Authorization cannot become approved without a selected participant
      system of record, named owner and approvers, approved recruitment channels,
      withdrawal channel/SLA, safety owner/deputy, and protocol approvals.
- [x] A human-readable register explains data purposes, locations, access,
      retention/deletion, consent receipts, incentives, accessibility, safety,
      and incident handling.
- [x] The consent-receipt template uses opaque IDs and purpose-specific choices
      without repository PII.
- [x] The research runbook and screener explicitly state that recruitment
      preparation is not outreach authorization.
- [x] Positive and negative tests prove the fail-closed authorization rules.
- [x] Protocol approvals bind exact protocol and consent-script revisions,
      dated approval evidence, review/expiry dates, allowed channels/cohorts,
      and independent processing permissions.
- [x] Operational open/paused/closed state is separate from durable approval,
      and authorization is evaluated for a specific protocol and activity.
- [x] The approved consent readout is placeholder-free and a versioned safety
      procedure defines stop, escalation, incident, and follow-up behavior.
- [x] Carl approves the closed framework for delivery; a named privacy/trust
      reviewer and complete operational controls remain required before any
      participant contact.

## Security, privacy, AI, data, and accessibility

- Data classes: planning metadata and empty consent/data-inventory templates;
  no participant records.
- Data-flow changes: local/CI validation reads a repository authorization record
  and makes no external calls.
- Roles/permissions: owner, project approver, privacy/trust approver, safety
  owner, and deputy are explicit gates.
- Consent/retention: purpose-specific receipt and retention/deletion fields are
  required before authorization.
- Deletion/revocation effects: withdrawal and deletion remain blocked until an
  approved channel, SLA, system of record, and receipt process exist.
- Threats/abuse: prevents accidental outreach, recording, oversharing, unsafe
  sessions, and repository storage of personal data.
- AI level and review: no AI or provider processing.
- Accessibility: accommodation needs and accessible communication paths are
  required planning inputs and must be optional/minimized.
- Logging/redaction: only opaque session/participant references may appear in
  repository evidence.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design.
- [x] Implement the smallest coherent change.
- [x] Add positive, negative, and failure-path tests.
- [x] Add observability without sensitive payloads: planning validation reports
      only control and protocol identifiers, never participant data.
- [x] Update contracts, docs, decisions, risks, and runbooks: no API contract,
      product decision, or risk rating changed; the planning validator,
      documentation governance, and research runbooks are updated.
- [x] Define rollout, feature-flag, migration, rollback, and recovery behavior:
      authorization remains false until human approval; rollback restores the
      previous runbook and retains the no-outreach state.

## Verification evidence

- [x] Focused tests: `node --test scripts/validate-plans.test.mjs` — 24/24
      passed; `pnpm plans:check` — 30/30 passed, 139 backlog tickets and 20
      ticket files validated.
- [x] Static/quality checks: `pnpm ci:check`, `pnpm format:check`,
      `pnpm typecheck`, `pnpm test`, and `git diff --check` passed on Node
      24.18.0.
- [x] Security/privacy checks: fail-closed draft, incomplete approval, closed
      outreach/recording, unknown protocol, complete approval, and no-PII
      repository boundaries reviewed and tested.
- [x] Accessibility/visual checks: no UI; authorization requires an approved
      accessibility/accommodation procedure before outreach.
- [x] Runtime/deployment checks: not applicable; repository planning control.
- [x] Rollout/rollback evidence: fail-closed additive controls; no participant
      contact or external mutation.

## Delivery evidence

- Branch: `ticket/ARG-030-research-operations`
- Commit: `f74bf1b`
- PR: [#90](https://github.com/carlwelchdesign/matchmaker-ai/pull/90) — owner
  approved for merge as a closed framework on 2026-08-28
- Merge: owner-authorized; GitHub PR merge record is authoritative
- Deployment: not applicable
- Evidence URLs/paths:
  - Asana task `1217966825442195`
  - `plans/research/research-authorization.json`
  - `plans/research/research-authorization-register.md`
  - `plans/templates/research-consent-receipt.md`
- Completion date: 2026-08-28

## Completion notes

The user approved continuing after ARG-029's green PR. ARG-030 became the sole
Asana WIP ticket on 2026-08-28. Drafting this package does not authorize human
research.

Architecture, delivery/TPM, and documentation specialists completed focused
implementation re-reviews. No P0 findings remain; all recommended handing off
the framework for owner review while operational controls stayed closed.

On 2026-08-28, Carl approved ARG-030 as a closed research-governance framework
and authorized PR #90 to merge. This approval does not authorize participant
outreach or data collection. The machine-readable controls remain `Not
approved`, operations remain `Closed`, all activity permissions remain `false`,
and a named privacy/trust reviewer plus complete protocol-specific operational
decisions are still required before participant activity.

- Follow-up owner: Carl Welch
