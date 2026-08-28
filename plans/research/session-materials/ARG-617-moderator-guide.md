# ARG-617 Matchmaker Analytics Workflow Moderator Guide

## Status and decision boundary

- **Ticket:** `ARG-617`
- **Evidence needed:** Representative matchmaker workflow testing.
- **Artifact status:** Owner-approved protocol; participant recruitment, consent,
  sessions, and synthesis are not yet complete.
- **Approval:** Carl Welch approved the participant sample and gate-review
  threshold on 2026-08-28. This approval covers the study design only; it does
  not authorize participant recruitment or contact.
- **Prototype boundary:** Use only the local synthetic admin dashboard and
  approved-facts inspection. Do not use real applicant, candidate, client, or
  partner records.
- **Non-goal:** This study does not approve authentication, persistence,
  analytics transport, production access, candidate scoring, or automated
  matching.

Use with:

- [Research operations runbook](../research-operations-runbook.md)
- [Consent and session script](../consent-and-session-script.md)
- [Research session notes template](../../templates/research-session-notes.md)
- [ARG-617 synthetic dry run](../synthetic-dry-runs/ARG-617-dashboard-reconciliation-walkthrough.md)

## Research question

Can a founder/operator or practicing matchmaker use the governed analytics and
approved-facts views to reconcile candidate-supply work without mistaking
missing data for zero, treating operational rates as candidate scores, or
moving sensitive work into side channels?

## Approved participant sample

| Segment | Approved minimum | Session ID pattern | Why it is needed |
| --- | ---: | --- | --- |
| Founder/operator | 1 | `ARG617-FND-001` | Tests fit with Argent's intended operating model |
| Practicing matchmaker/operator | 2 | `ARG617-MM-001` | Tests whether the workflow transfers beyond its designer |

Carl Welch approved this sample and the gate-review threshold on 2026-08-28.
Synthetic or internal-review sessions do not count toward the approved minimum.
Recruitment and participant contact require separate authorization.

## Study hypotheses

1. Participants can identify which measures are available, stale, suppressed,
   missing a denominator, or unavailable without an external reconciliation
   sheet.
2. Participants can explain the numerator, denominator, source, source time,
   and observation-quality exclusion for a displayed rate.
3. Participants can move from an aggregate signal to approved fact provenance
   without expecting raw interview content.
4. Participants do not interpret shortlist, mutual approval, meeting, or
   reciprocal-interest rates as candidate value or predicted relationship
   success.
5. Missing production actions and source data are understood as unavailable,
   not as hidden working controls or zero activity.

## Standard run of show

| Segment | Time | Activity |
| --- | ---: | --- |
| Opening and consent | 5 min | Read purpose, non-goals, and notes/quote/recording consent |
| Current reconciliation baseline | 7 min | Understand tools, cross-checks, and side channels used today |
| Task walkthrough | 25 min | Run the six synthetic tasks below without coaching |
| Interpretation and workaround probes | 5 min | Test trust, scoring, missing-data, and side-channel assumptions |
| Closeout | 3 min | Capture highest-value change, risk, and follow-up permission |

## Setup

- Use a clean local build of `apps/admin` at a desktop viewport.
- Start on the owner overview; do not preselect Analytics or Approved facts.
- Give the participant control of the prototype when practical.
- Prepare a session-notes file with a non-identifying session ID.
- Do not enable recording or transcription without explicit separate consent.
- Do not describe the synthetic figures as real performance, capacity, or
  candidate outcomes.

## Tasks and observable success

### Task 1 — Establish the reporting boundary

Prompt:

> Before using this view for a weekly review, tell me who you think can see it,
> what cohort and time window it covers, and what kind of data it does not
> contain.

Observe whether the participant finds the access context and separates product
analytics from operational records, legal audit evidence, security telemetry,
provider payloads, and candidate identity.

### Task 2 — Reconcile candidate supply and intake

Prompt:

> Give me a short operational readout of candidate supply and intake. Call out
> anything you would not treat as a confirmed number.

Success evidence includes distinguishing available candidates from known
availability, reading exact interview calculations, and treating eligible
assertions as source unavailable rather than zero.

### Task 3 — Explain discovery coverage

Prompt:

> Explain the retrieval and human-review figures to a colleague. Which records
> entered the rates, and which did not?

Success evidence includes 6 of 10 eligible opportunities retrieved, 4 of 6
retrieved opportunities reviewed, and one partial search excluded from the
displayed rates. The participant should not infer unique people, query content,
ranking quality, or candidate identity.

### Task 4 — Explain introduction outcomes

Prompt:

> What can and cannot be concluded from the Introduction outcomes section?

Success evidence includes the exact separate denominators, one partial journey
excluded, and an explicit rejection of candidate scoring or relationship-
success prediction.

### Task 5 — Investigate uncertainty with approved facts

Prompt:

> Move to the approved-facts view. Find one fact whose state or provenance would
> make you pause before using it. Show me what you would inspect and what you
> would do next.

Observe whether the participant uses provenance, freshness, knowledge state,
purpose, and role context. Asking a candidate to clarify is a valid human next
step; exposing raw interview content or silently manufacturing an answer is not.

### Task 6 — Plan the next review without a workaround

Prompt:

> Imagine this is the end of your weekly review. What would you record or hand
> off, and where would you be tempted to use a spreadsheet, private note, or
> message outside the system?

Capture the reason for every proposed side channel. Do not defend the prototype
or imply that a workaround is user error.

## Interpretation and trust probes

Ask after the tasks, without leading the participant toward the desired answer:

1. Which number would you verify first, and why?
2. Did any dash, null, or suppressed value look like zero activity?
3. Did any rate feel like a judgment about a person or a predicted match?
4. What evidence was missing when you wanted to take action?
5. Which step would still require another tool or another person?
6. What would make you keep a shadow spreadsheet or private note?
7. What should never be added to this dashboard?

## Capture rubric

Record one row per task:

| Field | Allowed values or format |
| --- | --- |
| Task result | Independent / completed with clarification / not completed |
| Time | Elapsed minutes and seconds; directional only for this small sample |
| Calculation interpretation | Exact / materially correct / incorrect |
| Missing-data interpretation | Correct / treated as zero / assumed hidden data |
| Provenance use | Used / noticed but did not use / not found |
| Scoring inference | None / corrected by participant / persisted after probe |
| Workaround signal | None / convenience / missing capability / trust or privacy concern |
| Severity | Low / medium / high |
| Evidence type | Participant behavior / participant statement / researcher inference |

Do not collect candidate names, profile contents, private romantic history, or
real operational screenshots in the planning repository.

## Approved gate-review threshold

Carl Welch approved this threshold on 2026-08-28. `ARG-617` can enter acceptance
review only when:

- the approved participant minimum is met;
- every participant completes Tasks 1 through 4 independently or with one
  neutral clarification;
- no participant persists in a candidate-value or relationship-success
  interpretation after the non-leading probe;
- every missing-data-as-zero error and every trust/privacy workaround signal is
  resolved or explicitly accepted by the owner;
- at least two participants can complete the weekly-review handoff without
  requiring an external reconciliation artifact for information already in the
  prototype; and
- findings, counterevidence, severity, and downstream changes are synthesized in
  the research tracker and linked from `ARG-617`.

Time-on-task alone does not establish reduced reconciliation. Compare observed
cross-checks, external artifacts requested, interpretation errors, and the
participant's current-process baseline.

## Stop and escalation conditions

Stop or redirect the session if a participant begins entering real personal
data, retrieves a real record, shares sensitive third-party details, or treats
the prototype as an active staff system. Record the interruption without the
sensitive content and route any privacy, safety, or access concern through the
approved owner process.

## Closeout

Ask:

1. What part of the review saved the most cross-checking, if any?
2. What still required manual reconciliation?
3. What would most likely drive a shadow workflow?
4. What is the highest-risk misunderstanding in this dashboard?
5. May we follow up with a clarification after synthesis?

Restate that the next step is synthesis and owner review, not production use.
