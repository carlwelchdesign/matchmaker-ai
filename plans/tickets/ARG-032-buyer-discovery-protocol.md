# ARG-032 — Prepare ARG-031 buyer-discovery protocol

- **Epic:** Research governance
- **Capability/requirement IDs:** CAP-001, CAP-004, CAP-007, CAP-010
- **Priority:** P0
- **Status:** Done
- **Artifact maturity:** Approved no-outreach protocol baseline
- **Named owner:** Carl Welch
- **Named approver/reviewer:** Project owner
- **Target milestone:** Decision gate
- **Estimate band:** M
- **Dependencies:** ARG-030
- **Decision/risk links:** R-002, R-021, R-023, R-025, R-040
- **Blocked reason/review date:** None
- **Asana task:** `1217967564755104`

## Outcome

ARG-031 has a concrete, approval-ready buyer-discovery protocol and evidence
package without contacting, screening, scheduling, or collecting data from any
participant.

## Scope

- Define the primary paying-client segment and keep adjacent/proxy participants
  analytically separate.
- Define a sample rationale and proposed recruitment sources without approving
  any channel or identifying any person.
- Define a minimized screener and recent-behavior interview guide covering
  problem intensity, alternatives, authority, switching triggers, trust, and
  credible commitment.
- Predeclare pass, revise, and stop thresholds plus disconfirming evidence.
- Add redacted evidence-ledger and synthesis templates.
- Register ARG-031 in the fail-closed authorization record with every activity
  disabled.

## Non-goals

- Participant outreach, screening, scheduling, sessions, notes, quotes,
  recording, transcription, follow-up, or reuse.
- Selecting a participant system, recruitment channel, incentive, provider,
  or operational owner without separate approval.
- Collecting names, contact details, exact income/net worth, romantic history,
  payment data, or other personal data.
- Treating synthetic review or hypothetical interest as buyer validation.
- Moving ARG-031 to `Ready` or `In progress`.

## Acceptance criteria

- [x] The protocol defines primary, excluded, and adjacent/proxy cohorts.
- [x] The protocol defines a sample rationale and completion minimum without
      claiming statistical representativeness.
- [x] The screener and guide prioritize recent behavior over hypothetical
      concept reactions and avoid unnecessary sensitive questions.
- [x] Authority, alternatives, switching triggers, and commitment are evaluated
      with observable evidence levels.
- [x] Pass/revise/stop thresholds and disconfirming evidence are predeclared.
- [x] Evidence and synthesis templates preserve opaque references, source
      traceability, negative evidence, and cohort separation.
- [x] ARG-031 is registered with exact artifact hashes and all permissions
      `false` while operations remain `Closed`.
- [x] Positive and negative validation proves ARG-031 cannot enter active work
      without current outreach authorization.
- [x] Project owner completes review and records an approve, revise, or reject
      disposition; PR approval may serve as that evidence when its scope is
      explicit.

## Security, privacy, AI, data, and accessibility

- Data classes: planning metadata and empty templates only.
- Data-flow changes: local/CI validation reads versioned repository artifacts;
  no external calls.
- Roles/permissions: ARG-031 inherits the separate project-owner and
  privacy/trust approval gates from ARG-030.
- Consent/retention: no consent is collected; the generic consent readout must
  be resolved and separately approved before any later session.
- Deletion/revocation effects: not operational; all participant systems and
  withdrawal controls remain unset.
- Threats/abuse: the protocol rejects unnecessary intimate, financial,
  identity, and protected-class collection.
- AI level and review: no AI or provider processing.
- Accessibility: proposed research must offer an optional, minimized
  accommodation path before authorization.
- Logging/redaction: only opaque participant and evidence references may enter
  repository research evidence after authorization.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design: no runtime API or personal data.
- [x] Implement the smallest coherent protocol package.
- [x] Add positive, negative, and failure-path tests.
- [x] Update authorization, register, backlog, and documentation evidence.
- [x] Require immutable completion evidence before governed research can be
      marked `Done`.
- [x] Run focused and repository verification.
- [x] Review the final diff for placeholders, unsupported claims, and scope
      expansion.

## Verification evidence

- [x] Focused planning tests: 35/35 passed.
- [x] Planning package validation: 140 backlog tickets and 21 ticket files.
- [x] Formatting, typecheck, tests, and diff hygiene.
- [x] GitHub checks.

## Delivery evidence

- Branch: `ticket/ARG-032-buyer-discovery-protocol`
- Commit: `6b6274b`
- PR: [#91](https://github.com/carlwelchdesign/matchmaker-ai/pull/91) (merged)
- Merge: `f2e0bf4aaffad9d784558c36d35f662b17792b25`
- Deployment: not applicable
- Evidence URLs/paths:
  - Asana task `1217967564755104`
  - `plans/research/ARG-031-buyer-discovery-protocol.md`
  - `plans/templates/buyer-discovery-evidence-ledger.md`
  - `plans/templates/buyer-discovery-synthesis.md`
- Completion date: 2026-08-28

## Completion notes

The user authorized creating this prerequisite and beginning work on 2026-08-28.
Creating the protocol package does not authorize ARG-031 participant activity.

On 2026-08-28, the project owner approved ARG-032 as the no-outreach
buyer-discovery protocol baseline and authorized PR #91 to merge. The approval
explicitly does not authorize participant outreach or data collection.

- Follow-up owner: Carl Welch
