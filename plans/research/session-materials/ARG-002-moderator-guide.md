# ARG-002 Moderator Guide

## Purpose

Run founder/operator, matchmaker/operator, and case-walkthrough sessions
consistently enough to support lifecycle and service-blueprint decisions.

Use with:

- [ARG-002 protocol](../ARG-002-founder-matchmaker-workflow.md)
- [Consent and session script](../consent-and-session-script.md)
- [Research session notes template](../../templates/research-session-notes.md)

## Standard run of show

| Segment | Time | Activity |
| --- | ---: | --- |
| Opening and consent | 5 min | Read purpose, non-goals, note/quote/recording consent |
| Context | 5 min | Confirm participant role and relevant experience |
| Workflow walkthrough | 25 min | Walk from lead/application to decision/outcome |
| Decision-point probe | 15 min | Clarify hard decisions, uncertainty, escalation, and status copy |
| System/human split | 10 min | Identify what software should support, hide, or avoid |
| Closeout | 5 min | Ask for missing steps, risks, and follow-up permission |

## Founder/operator session

### Setup

- Session ID pattern: `ARG002-FND-001`
- Evidence goal: operating model, client/candidate distinction, current process,
  promises, failure modes.

### Core prompts

1. Start with a representative engagement. How did it begin?
2. What happened before anyone paid or formally applied?
3. Where did you decide this person was a client, candidate, lead, referral, or
   not a fit?
4. What information was essential at each step?
5. What did you intentionally avoid asking or writing down?
6. What communication channels were used?
7. What status did the person understand they were in?
8. Where did you need discretion or human judgment?
9. What could software make faster without making the service feel generic?
10. What would be harmful to automate?

### Decision probes

- What makes a person ready for intake?
- What makes a person safe to introduce?
- What makes a person waitlisted versus declined?
- What service expectations are reasonable before payment?
- What service expectations are reasonable after payment?
- What would create reputational damage fastest?

## Matchmaker/operator session

### Setup

- Session ID pattern: `ARG002-MM-001`
- Evidence goal: repeatable matchmaker workflow, notes/provenance, search,
  shortlist, introduction, feedback, and service recovery.

### Core prompts

1. Describe your intake process for a paying client.
2. How do you convert stated preferences into actual search criteria?
3. Which criteria are non-negotiable, negotiable, or exploratory?
4. How do you handle contradictory preferences?
5. What do you need to know before recommending someone?
6. What notes are useful later?
7. What notes are too sensitive or too subjective to store?
8. How do you get permission from each person before revealing information?
9. What happens after an introduction?
10. What signals are useful but dangerous to overinterpret?

### Tooling probes

- What should be in the review queue first?
- What makes a profile credible enough for review?
- What search filters are factual versus judgment-based?
- What should an explanation/rationale include?
- What should the system never rank or score?
- What would cause matchmakers to work around the system?

## Case walkthrough

### Setup

- Session ID pattern: `ARG002-CASE-001`
- Case may be real-redacted or synthetic. Label it clearly.

### Walkthrough template

1. Source: campaign, referral, inbound, client search, partner, other.
2. Initial role: lead, applicant, candidate, client, partner referral.
3. First human action.
4. First system action, if any.
5. Required information.
6. Missing or conflicting information.
7. Decision point.
8. Status communicated.
9. Consent/privacy consideration.
10. Outcome.
11. What would have helped?
12. What would have harmed trust?

## Capture rules

- Capture behavior and decisions, not gossip.
- Replace personal specifics with role labels.
- Label uncertain interpretations as inference.
- Tag downstream impact immediately:
  - `ARG-005` lifecycle
  - `ARG-011` metrics/capacity
  - `ARG-012` service blueprint
  - `ARG-026` match constructs
  - `ARG-401` application
  - `ARG-406` review queue
  - `ARG-501` profiles
  - `ARG-505` recommendations

## Closeout questions

1. What did I miss?
2. Which part of this workflow matters most to the feeling of a premium service?
3. Which part is highest risk?
4. Who else should we talk to before building?
5. May we follow up with clarifying questions?
