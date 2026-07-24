# ARG-002 Founder and Matchmaker Workflow Research Protocol

## Purpose

Document the founder and matchmaker operating workflow well enough to approve
domain lifecycles, service blueprinting, staffing assumptions, and matchmaker
tooling scope without guessing from generic dating-app patterns.

## Current evidence baseline

Confirmed from project notes and approved `ARG-001`:

- Argent is a human-led, high-touch matchmaking service platform.
- Anyone may apply, but admission is selective and human-reviewed.
- Santa Barbara County/Montecito is the first geofenced campaign test ground,
  not the long-term customer boundary.
- Partners participate through controlled Argent campaigns.
- AI may assist but may not admit, reject, rank, or introduce people.
- Candidate application is free for the first pilot.
- Paid services should use admin-configured Stripe pricing after commerce
  policy approval.

Assumptions requiring research:

- The founder's actual end-to-end operating process.
- How practicing matchmakers decide whether someone is ready for review,
  acceptance, waitlist, rejection, interview, verification, shortlisting, and
  introduction.
- Which notes and observations are necessary versus nice-to-have.
- Where human judgment, discretion, and service recovery matter most.
- Which tasks belong in software versus concierge communication.

## Research cohort

Minimum evidence before ARG-002 can be marked `Done`:

- 1 founder/operator workflow interview.
- 2 practicing matchmaker or high-touch service operator interviews.
- 5 recent or synthetic case walkthroughs from lead/application to outcome.

If practicing matchmakers are not available, record that limitation and keep
ARG-005, ARG-012, and matchmaking implementation tickets blocked until the gap
is resolved or an owner approves a narrower fallback.

Use the shared research operations files before scheduling:

- [Research operations runbook](research-operations-runbook.md)
- [Participant screener](participant-screener.md)
- [Consent and session script](consent-and-session-script.md)
- [Research synthesis tracker](research-synthesis-tracker.md)
- [ARG-002 moderator guide](session-materials/ARG-002-moderator-guide.md)

## Interview guide

### Founder/operator interview

1. Walk through the last successful or representative matchmaking engagement
   from first contact to follow-up.
2. What makes someone a paying client versus a candidate?
3. What information must be known before taking payment?
4. What information must be known before accepting a candidate?
5. What are the most common reasons to waitlist, decline, pause, or request
   more information?
6. Which parts are currently done by text, phone, email, spreadsheets, memory,
   or documents?
7. What must never be automated?
8. What status language can be safely shown to applicants, candidates, and
   clients?
9. What are the service promises Argent can make confidently?
10. What are the failure modes that would damage trust fastest?

### Matchmaker workflow interview

1. How do you intake a paying client?
2. How do you translate stated preferences into search criteria?
3. Which criteria are hard constraints, soft preferences, or conversation
   starters?
4. How do you handle incomplete, contradictory, or aspirational preferences?
5. How do you evaluate a potential candidate before suggesting them?
6. What do you write down, and what do you deliberately avoid recording?
7. How do you ask for permission before an introduction?
8. How do you follow up after an introduction or date?
9. What signals are useful but dangerous to overinterpret?
10. What software would slow you down or make the service feel less personal?

### Case walkthrough prompts

For each case, capture:

- source or campaign;
- person role: lead, applicant, candidate, client, partner referral;
- decision points;
- required information;
- human actions;
- system actions;
- messages sent;
- consent or privacy implications;
- outcome;
- unresolved ambiguity.

Do not capture real names, contact information, intimate details, health data,
financial account data, or unnecessary sensitive traits in planning notes.

## Evidence capture table

| Evidence ID | Source | Role | Workflow step | Finding | Confidence | Downstream impact |
| --- | --- | --- | --- | --- | --- | --- |
| ARG002-E01 | Pending | Founder | Intake | Pending | Low | ARG-005 ARG-012 |
| ARG002-E02 | Pending | Matchmaker | Review | Pending | Low | ARG-005 ARG-406 |
| ARG002-E03 | Pending | Case walkthrough | Introduction | Pending | Low | ARG-501 ARG-507 |

## Synthesis rubric

Classify each finding:

- `Must support in MVP`: blocks core human-led service.
- `Manual fallback acceptable`: can be handled outside software during pilot.
- `Policy decision needed`: requires owner/legal/security approval.
- `Later optimization`: defer until pilot evidence.
- `Do not build`: conflicts with trust, privacy, or service positioning.

## Required outputs

ARG-002 can move to `Done` only after the PR updates:

- workflow map for founder/operator process;
- workflow map for matchmaker review/search/introduction/follow-up;
- case walkthrough synthesis;
- software-versus-human responsibility split;
- open policy questions for ARG-005, ARG-012, ARG-013, ARG-401, ARG-406,
  ARG-501, and ARG-505;
- risks if matchmaker workflow evidence remains thin.

## Downstream gates affected

- `ARG-005` admission, candidate, client, and campaign lifecycles.
- `ARG-009` private beta plan.
- `ARG-011` metric thresholds and capacity assumptions.
- `ARG-012` service blueprint.
- `ARG-016` trust and brand claims.
- `ARG-026` match-science construct validation with practicing matchmakers.
- Phase 2 and Phase 3 implementation tickets.
