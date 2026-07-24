# ARG-003 Concept and Language Testing Protocol

## Purpose

Test whether applicants, candidates, clients, and internal operators correctly
understand Argent's selective, elite, private, human-led service without
hearing misleading guarantees, pay-to-play promises, discriminatory signals, or
overconfident AI claims.

## Current evidence baseline

Confirmed from project notes and approved `ARG-001`:

- Anyone may apply; not everyone gets admitted.
- Argent should feel classy, clean, elite, private, and high-end.
- “Elite” must be expressed through discretion, service quality, curation, and
  confidence, not demeaning or exclusionary copy.
- Santa Barbara County/Montecito is the first geofenced beta campaign.
- Candidate application is free for the first pilot.
- Paid packages are administered through Argent and should use Stripe after
  commerce policy approval.
- Human-led process promises are approved; romantic outcomes are not promised.
- Optional conversational intake remains a concept until privacy, consent,
  speech, accessibility, and correction workflows are approved.

## Concepts to test

### Concept A — Public Argent application

Key message: Argent is a private, selective matchmaking network. Anyone may
apply; admission is reviewed by humans.

Questions:

- Does “apply” imply guaranteed review, response, or acceptance?
- Does “selective” feel clear, respectful, and lawful?
- Does “elite” imply wealth-only, social rank, beauty, gender, race, or status
  exclusion?
- What privacy expectations does the page create?

### Concept B — Montecito/Santa Barbara campaign

Key message: Argent is running a bounded local campaign to recruit up to 100
men and 100 women for the first beta test ground.

Questions:

- Does the local campaign sound like Argent is only for Santa Barbara County?
- Does “100/100” sound like a quota, promise, popularity contest, or capacity
  cap?
- Does invite/referral language imply acceptance, endorsement, or priority?
- Is the relationship between Argent and any partner brand clear?

### Concept C — Application path choice

Key message: Applicants may use structured, conversational, or hybrid intake
only if each path creates the same reviewable application and the applicant
approves recorded fields.

Questions:

- Which path feels most private, accurate, efficient, and high quality?
- Does AI assistance feel helpful or intrusive?
- Does voice input create oversharing or recording concerns?
- Do people understand they can correct, reject, or mark proposed fields
  private?

### Concept D — Status and outcome language

Key message: Argent can communicate process status without implying personal
worth, guaranteed matching, or final judgment.

Questions:

- Which words feel respectful for `submitted`, `in review`, `waitlisted`,
  `needs information`, `not admitted`, and `withdrawn`?
- Does `verified` imply too much safety certainty?
- Does `accepted` imply social endorsement or guaranteed introductions?
- What support path is expected after rejection or waitlist?

## Research cohort

Minimum evidence before ARG-003 can be marked `Done`:

- 3 applicant/candidate concept reviews.
- 2 potential paying-client concept reviews.
- 1 founder/operator copy review.
- 1 accessibility-oriented review covering reading burden, language clarity,
  keyboard/screen-reader implications of concept states, and alternate intake
  needs.

If real participants are unavailable, synthetic or internal review may unblock
prototype iteration but must not unblock real applicant intake, brand claims, or
conversational/voice implementation.

Use the shared research operations files before scheduling:

- [Research operations runbook](research-operations-runbook.md)
- [Participant screener](participant-screener.md)
- [Consent and session script](consent-and-session-script.md)
- [Research synthesis tracker](research-synthesis-tracker.md)

## Test method

Use low-fidelity copy and wireframe prompts. Avoid collecting sensitive personal
answers. Ask participants to paraphrase what they believe Argent offers and what
they believe happens next.

For each concept, capture:

- comprehension;
- trust;
- perceived privacy;
- perceived exclusivity;
- perceived fairness;
- expected cost;
- expected human involvement;
- expected use of AI;
- emotional reaction;
- misleading interpretations;
- requested clarifications.

## Language risks to watch

| Term | Risk | Safer test direction |
| --- | --- | --- |
| Elite | May imply social worth, beauty, race, class, or status exclusion | Tie to service quality, discretion, and standards |
| Accepted | May imply endorsement or guaranteed introductions | Pair with exact network/service status |
| Verified | May imply complete safety | State defined checks and limits |
| Invite | May imply admission or priority | Say it starts or attributes an application only |
| Match | May imply outcome certainty | Use curated introduction and mutual approval language |
| AI | May imply objective ranking or hidden judgment | State assistive summarization/retrieval with human review |

## Evidence capture table

| Evidence ID | Source | Segment | Concept | Finding | Severity | Downstream impact |
| --- | --- | --- | --- | --- | --- | --- |
| ARG003-E01 | Pending | Applicant/candidate | Public application | Pending | Unknown | ARG-016 ARG-018 |
| ARG003-E02 | Pending | Potential client | Service promise | Pending | Unknown | ARG-010 ARG-017 |
| ARG003-E03 | Pending | Accessibility review | Intake choice | Pending | Unknown | ARG-027 ARG-613 |

## Synthesis rubric

Classify each tested phrase or concept:

- `Approved language`: understood correctly by most participants and reviewed
  for privacy/accessibility risk.
- `Needs revision`: creates confusion or emotional friction but can be fixed.
- `Policy escalation`: implies eligibility, payment, verification, consent, or
  legal commitments requiring owner/legal review.
- `Prohibited`: creates discriminatory, demeaning, predictive, or misleading
  expectations.

## Required outputs

ARG-003 can move to `Done` only after the PR updates:

- tested concept set and participant matrix;
- language findings and approved/rejected terms;
- implications for Nocturne final approval in `ARG-004`;
- implications for brand claims in `ARG-016`;
- implications for first-time application and consent in `ARG-018`;
- implications for conversational intake in `ARG-027`;
- open policy issues for privacy/legal review in `ARG-006`.

## Downstream gates affected

- `ARG-004` Nocturne final founder/design approval.
- `ARG-005` lifecycle language.
- `ARG-006` privacy/legal screening.
- `ARG-016` luxury inclusive content and trust claims.
- `ARG-018` first-time application and consent prototype.
- `ARG-026` matching claims and construct language.
- `ARG-027` optional conversational intake.
