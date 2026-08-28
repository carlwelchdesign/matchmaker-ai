# ARG-617 Synthetic Dashboard Reconciliation Walkthrough

## Status and use

- **Evidence type:** Synthetic internal dry run.
- **Created:** 2026-08-28.
- **Purpose:** Verify that the ARG-617 moderator guide is executable against the
  local synthetic admin prototype.
- **Limitation:** This is not founder, matchmaker, operator, usability, or
  acceptance evidence. It does not satisfy the representative workflow-testing
  gate.

## Dry-run setup

- Prototype: local `apps/admin` Analytics and Approved facts views.
- Data: repository-owned synthetic fixtures only.
- Session ID: `ARG617-SYN-001`.
- Reviewer posture: follow the moderator prompts without inventing hidden data
  or production actions.

## Task walkthrough

| Task | Synthetic walkthrough | Protocol check |
| --- | --- | --- |
| Reporting boundary | Access context identifies Matchmaker, Internal staff, Synthetic pilot cohort, a 24-hour UTC window, and generation time. The separation notice excludes operational, legal-audit, security, provider, and identity data. | Runnable without production credentials or private data. |
| Candidate supply and intake | Candidate supply is 6; approved-field coverage is 18 of 24; availability is 3 available and 5 of 6 known; interview completion is 4 of 6; approved fields are 12; correction burden is 2 of 4. Eligible assertions remain source unavailable, not zero. | Prompt exposes whether missing-data semantics are understood. |
| Discovery coverage | Retrieval is 6 of 10 eligible opportunities and human review is 4 of 6 retrieved opportunities. Two of three recorded searches are complete; one partial search is excluded. Criteria and policy provenance are version-only. | Prompt can distinguish opportunity counts from unique people and reveal denominator errors. |
| Introduction outcomes | Shortlist is 4 of 4 reviewed journeys; mutual approval is 1 of 3 recommendations; first meeting is 1 of 1 delivery; reciprocal interest is 1 of 1 meeting. Four of five journeys are complete; one partial journey is excluded. | Prompt can reveal generalized-score or success-prediction interpretations. |
| Approved-fact uncertainty | The view exposes synthetic knowledge states, provenance, purpose/role context, freshness, and a clarification-oriented human next step without raw interview content. | Prompt is runnable, but a real participant must choose what creates hesitation. |
| Weekly handoff | The prototype supports a verbal operational readout and identifies missing sources. It has no persistence, assignment, export, annotation, or workflow action. | The moderator must capture requested side channels rather than presenting absent controls as defects already proven. |

## Dry-run findings

### Protocol strengths

- Exact numerator and denominator prompts can be answered from visible labels;
  no calculation must be reverse engineered.
- Search and workflow observation-quality copy makes excluded partial records
  testable instead of leaving denominator omissions implicit.
- The source-unavailable eligible-assertions card provides a direct test of the
  “unknown is not zero” boundary.
- The approved-facts task connects aggregate analytics to provenance and
  uncertainty without exposing content-bearing evidence.

### Protocol risks to watch in real sessions

- Participants may read the synthetic values aloud without integrating them
  into a weekly-review decision. The moderator should ask what action or handoff
  follows, not award success for recitation.
- A participant may request export or annotation because those actions are
  genuinely absent. Capture whether the need is reconciliation, convenience,
  trust, or workflow ownership before proposing a feature.
- One founder/operator session cannot establish transferability to practicing
  matchmakers; the proposed external operator segment remains necessary.
- The prototype's local-concept notices can lower expectations. Ask participants
  to explain the intended future workflow while preserving the current
  disconnected-state boundary.

## Dry-run result

The moderator guide is executable against the synthetic prototype and can
collect denominator interpretation, provenance use, missing-data errors,
scoring inference, and workaround signals. No representative participant
evidence exists yet. Owner approval of the sample and threshold, recruitment,
consent, sessions, and synthesis remain required before the ARG-617 workflow-
testing criterion can change.
