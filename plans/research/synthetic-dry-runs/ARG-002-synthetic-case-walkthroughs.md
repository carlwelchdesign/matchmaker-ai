# ARG-002 Synthetic Case Walkthroughs

## Status and use

- **Evidence type:** Synthetic dry run.
- **Created:** 2026-07-24.
- **Purpose:** Exercise the ARG-002 workflow prompts before real
  founder/matchmaker research.
- **Limitation:** These are not founder, matchmaker, applicant, candidate, or
  client evidence. They may identify likely workflow issues and planning
  questions, but they do not close ARG-002.

## Synthetic case 1 — Campaign applicant to waitlist

| Field | Dry-run walkthrough |
| --- | --- |
| Session ID | `ARG002-CASE-SYN-001` |
| Source | Montecito/Santa Barbara campaign |
| Initial role | Applicant |
| First human action | Review submitted application for completeness, campaign attribution, eligibility, and obvious safety/escalation issues |
| First system action | Save campaign attribution, application status, consent receipt, and source provenance |
| Required information | Contact path, age/adult confirmation, service-area relation, relationship intent, privacy consent, basic profile, availability for follow-up |
| Missing/conflicting information | Applicant says they want discretion but also requests public visibility into accepted members |
| Decision point | Waitlist rather than decline because application may fit future client needs but current campaign capacity is limited |
| Status communicated | “We are not moving forward right now, but may revisit your application if campaign or client needs change.” |
| Consent/privacy consideration | Campaign consent must not become broad Argent-network sharing without separate notice |
| Outcome | Waitlisted with no promise of future contact |
| Helped | Clear distinction between application receipt, campaign attribution, and network admission |
| Harmed trust | Suggesting waitlist is an endorsement or that referrals improve ranking |

### Planning implications

- `ARG-005`: needs separate application, campaign participation, and network
  membership lifecycle states.
- `ARG-014`: waitlist/capacity policy needs clear campaign-specific rules.
- `ARG-016`: waitlist copy must not imply personal worth or priority.

## Synthetic case 2 — Paying client lead to contracted service

| Field | Dry-run walkthrough |
| --- | --- |
| Session ID | `ARG002-CASE-SYN-002` |
| Source | Founder referral |
| Initial role | Client lead |
| First human action | Qualification conversation to understand goals, constraints, privacy needs, and service fit |
| First system action | Record lead status, referral source, and notes provenance without creating candidate visibility |
| Required information | Search geography, relationship goals, dealbreakers, service expectations, availability, privacy constraints, package fit |
| Missing/conflicting information | Client expects a guaranteed number of introductions before scope/capacity is validated |
| Decision point | Move to qualified lead only after no-guarantee boundary is understood |
| Status communicated | “Qualified for service discussion; not yet contracted or active.” |
| Consent/privacy consideration | Payment setup should not expose candidate data or imply priority in matching |
| Outcome | Sent service agreement/payment path after package terms are approved |
| Helped | Human conversation before payment; explicit no-outcome-guarantee language |
| Harmed trust | Taking payment before defining scope, refund terms, or response expectations |

### Planning implications

- `ARG-010`: pricing and package terms must define what client payment buys.
- `ARG-017`: refund/cancellation/non-performance policy is a blocker before
  real payment.
- `ARG-106`: Stripe/admin pricing requires environment and secret management.

## Synthetic case 3 — Candidate considered for introduction

| Field | Dry-run walkthrough |
| --- | --- |
| Session ID | `ARG002-CASE-SYN-003` |
| Source | Existing Argent candidate network |
| Initial role | Candidate |
| First human action | Matchmaker reviews candidate facts against a paying client's explicit criteria |
| First system action | Retrieve only permissioned candidate facts and show provenance |
| Required information | Current availability, relationship intent, location flexibility, key hard constraints, approved profile summary |
| Missing/conflicting information | Candidate has not recently confirmed availability or consent for this kind of introduction |
| Decision point | Request updated availability/permission before adding to shortlist |
| Status communicated | Candidate sees a discrete request, not the client's full private search context |
| Consent/privacy consideration | Mutual approval before identifying either person |
| Outcome | Candidate approves being considered; matchmaker may add to shortlist |
| Helped | Provenance, consent recency, and uncertainty labels |
| Harmed trust | Revealing client details too early or implying compatibility certainty |

### Planning implications

- `ARG-501`: profile fields need provenance, freshness, and visibility scope.
- `ARG-505`: human-authored rationale must include uncertainties.
- `ARG-506`: mutual approval must be an independent lifecycle.

## Synthetic case 4 — Partner referral with limited visibility

| Field | Dry-run walkthrough |
| --- | --- |
| Session ID | `ARG002-CASE-SYN-004` |
| Source | Campaign partner referral |
| Initial role | Referred applicant |
| First human action | Confirm referral attribution without exposing application content to partner |
| First system action | Attach referral/invite metadata and partner-reporting scope |
| Required information | Invite/referral code, campaign consent, applicant application data, partner attribution consent |
| Missing/conflicting information | Applicant assumes partner can see their application status |
| Decision point | Allow application to proceed but show privacy clarification |
| Status communicated | “Your referral may be attributed to the campaign. The partner does not receive your private application details.” |
| Consent/privacy consideration | Aggregate-only partner reporting for pilot |
| Outcome | Application continues under Argent control |
| Helped | Plain-language “who can see this” copy |
| Harmed trust | Partner dashboard showing person-level status or notes |

### Planning implications

- `ARG-015`: aggregate-only partner boundary needs approval.
- `ARG-204`: partner access grants must be purpose-limited and expiring.
- `ARG-310`: campaign reporting must avoid person-level leakage.

## Synthetic case 5 — Safety/support escalation

| Field | Dry-run walkthrough |
| --- | --- |
| Session ID | `ARG002-CASE-SYN-005` |
| Source | Applicant support message |
| Initial role | Applicant |
| First human action | Triage support message for safety, abuse, withdrawal, correction, or ordinary help |
| First system action | Create restricted support/escalation event without exposing sensitive content broadly |
| Required information | Request type, urgency, consent/withdrawal effect, contact preference |
| Missing/conflicting information | Applicant asks to delete campaign data but also wants future consideration |
| Decision point | Clarify withdrawal versus correction versus deletion request |
| Status communicated | “We need to confirm whether you want to withdraw, correct information, or request deletion.” |
| Consent/privacy consideration | Deletion and withdrawal consequences must be explainable and auditable |
| Outcome | Routed to privacy/support workflow; no matching action continues until resolved |
| Helped | Separate support, privacy, safety, and application states |
| Harmed trust | Treating support request as a negative admission signal |

### Planning implications

- `ARG-207`: privacy rights workflow must coordinate with application status.
- `ARG-211`: incident/break-glass workflow needed before real profiles.
- `ARG-214`: intake safety escalation needs clear non-punitive handling.

## Synthetic synthesis

### Repeated patterns

- Application, campaign attribution, network membership, client engagement,
  verification, support, and introductions must remain separate lifecycles.
- Most trust risk comes from ambiguous status, visibility, payment, partner
  access, and implied guarantees.
- Matchmaker tools need provenance, freshness, uncertainty, and consent recency
  before ranking or search sophistication.
- Support/privacy requests must not silently become negative admission or
  matching signals.

### Human/system split hypotheses

| Area | Human-owned | System-supported |
| --- | --- | --- |
| Admission | Review, judgment, exception handling, escalation | Queue, provenance, completeness, status, audit |
| Client qualification | Service fit, expectation setting, package recommendation | Lead status, notes provenance, payment state |
| Candidate shortlist | Rationale, uncertainty, final decision | Search/retrieval, filters, consent/freshness warnings |
| Introduction | Mutual permission, timing, communication judgment | Approval lifecycle, status, reminders, audit |
| Support/privacy | Interpretation, empathy, escalation | Request tracking, state effects, deletion/revocation ledger |

### Open questions for real research

- Which notes do practicing matchmakers refuse to store because they are too
  subjective or sensitive?
- Which review-queue fields actually speed up high-touch review?
- How much status detail is reassuring versus risky?
- What service scope must be defined before taking payment?
- Which support/privacy requests occur most often in practice?

### Downstream gating impact

- `ARG-005` should model independent lifecycle state machines.
- `ARG-012` should produce a service blueprint with human/system swimlanes.
- `ARG-026` should validate constructs with real matchmaker interviews before
  any retrieval/rationale implementation.
- `ARG-401` and `ARG-406` should not start from generic form/review assumptions.
