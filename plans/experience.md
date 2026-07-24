# Experience and Workflow Plan

## Independent lifecycles

Admission, network membership, commercial service, verification, and introductions are separate. A person may be both a candidate and a paying client.

### Application review

`DRAFT → SUBMITTED → IN_REVIEW → NEEDS_INFORMATION / INTERVIEW → APPROVED / WAITLISTED / DECLINED / WITHDRAWN / CLOSED`

### Candidate membership

`INVITED → PENDING_TERMS → ACTIVE → PAUSED / SUSPENDED / WITHDRAWN / EXPIRED`

### Client engagement

`LEAD → QUALIFIED → CONTRACTED → ONBOARDING → ACTIVE → PAUSED → COMPLETED / CANCELLED / TERMINATED`

### Verification

`NOT_STARTED → PENDING → NEEDS_ACTION → VERIFIED_FOR_DEFINED_CHECKS / INCONCLUSIVE / DISPUTED / EXPIRED`

### Introduction

`PROPOSED → AWAITING_PARTICIPANT_A → AWAITING_PARTICIPANT_B → MUTUALLY_APPROVED → REVEALED → SCHEDULED → COMPLETED`

Terminal/exception states include `DECLINED`, `EXPIRED`, `REVOKED`, `CANCELLED`, and `SAFETY_HOLD`.

Each lifecycle needs an allowed actor/transition table, entry/exit effects, reason policy, external-safe status copy, notification behavior, audit event, reversibility/appeal rules, and retention effects.

## Campaign lifecycle

`DRAFT → INTERNAL_REVIEW → SCHEDULED → ACTIVE → PAUSED → CLOSED → ARCHIVED`

Each campaign defines:

- public name and relationship to Argent;
- approved logo, imagery, copy, and contact details;
- geographic eligibility and how it is evaluated;
- dates, target counts, and waitlist behavior;
- application schema additions;
- invite-code rules and referral attribution;
- consent text and data-use scope;
- partner users and report permissions;
- success measures and post-campaign retention behavior.

Invite codes default to attribution and optional campaign access. They do not bypass eligibility, imply acceptance or trust, improve match ranking, or reserve capacity unless an approved campaign policy explicitly says so. Invalid or expired codes should fall back to ordinary application where policy permits.

Campaign membership is an attributed relationship to an Argent person/profile, not a duplicate person record.

## Applicant journey

1. Arrive through a campaign or Argent link.
2. Understand selectivity, privacy, eligibility, and expected time.
3. Create/resume an application.
4. Choose a structured, conversational, or hybrid intake path without affecting admission treatment.
5. Provide profile, preferences, consent, and media; if speaking, explicitly start each recording and correct its transcript.
6. Review each source-grounded proposed field, then approve, edit, reject, or mark it private.
7. Review the same normalized application regardless of intake mode and submit.
8. Receive status without misleading guarantees.
9. Respond to requests for information or interview.
10. Complete approved verification steps.
11. Accept network/client terms if admitted.
12. Control profile visibility, source retention, communication preferences, withdrawal, and deletion requests.

Required states include loading, saved, unsaved, offline/interrupted, upload failure, expired invite, ineligible geography, duplicate identity, verification failure, permission denied, waitlisted, declined, withdrawn, and support escalation.

Consent UX requires layered notices, a plain-language “who can see this” explanation, separate optional choices, a receipt, revocation consequences, and confirmation.

Conversational intake must remain optional, visibly AI-assisted, non-anthropomorphic by default, and interchangeable with typed entry. It may clarify or summarize what the applicant said but may not infer a diagnosis, personality type, honesty, emotional state, or hidden preference. The full prototype and evaluation boundary is in [conversational-intake.md](conversational-intake.md).

## Matchmaker workflow

1. Review applicants using an approved, transparent queue policy.
2. Inspect provenance, consent, completeness, and safety/verification status.
3. Record interview notes and structured observations.
4. Accept, request information, waitlist, decline, or escalate.
5. Build a search using hard constraints and soft preferences.
6. Review explainable candidate results.
7. Create and compare a shortlist.
8. Record why a candidate may fit and identify uncertainties.
9. Obtain approval from each person separately.
10. Make the introduction.
11. Schedule follow-up and capture feedback.
12. Record outcomes, safety concerns, and future eligibility.

## Accepted-member mobile journey

The first Flutter release should focus on high-value, time-sensitive actions:

- secure sign-in and device/session management;
- profile and privacy review;
- introduction requests and approve/decline decisions;
- communication preferences and push notifications;
- date feedback and follow-up;
- support, report, and safety escalation;
- withdrawal and privacy requests.

Application authoring may remain web-first until research shows a native need.

## Partner journey

A partner can:

- preview approved campaign branding and status;
- use approved invite/referral mechanisms;
- view aggregate campaign performance;
- request campaign changes subject to Argent approval.

The consenting service pilot is aggregate-only. Person-level access is deferred. Any later exception requires named participant consent, a specific purpose, field/action scope, Argent approval, expiration, immediate revocation, and audit.

A partner cannot:

- browse the full Argent network;
- see private matchmaker, safety, screening, or unrelated campaign notes;
- change consent, retention, admission, or matching policies;
- export sensitive records without an approved workflow;
- create staff roles or bypass Argent review.

## UX research before build

- Use [ARG-002 founder/matchmaker workflow research](research/ARG-002-founder-matchmaker-workflow.md)
  and
  [ARG-003 concept/language testing](research/ARG-003-concept-language-testing.md)
  as the executable Phase 0 research protocols.
- Interview the founder and at least two practicing matchmakers.
- Walk through five recent or simulated cases from application to outcome.
- Test application language with representative candidates.
- Test what “elite,” “verified,” “accepted,” and “confidential” imply to users.
- Validate which workflows need mobile, web, or human concierge support.
- Prototype admission status and consent explanations before finalizing the data model.
- Produce a service blueprint separating human/concierge work from system work.
- Test the first-time application and consent prototype before implementation estimates are treated as reliable.
- Compare structured, conversational, and hybrid intake for control, completion, accuracy, oversharing, accessibility, and correction burden.
- Validate match constructs and claims with relationship-science or psychometrics expertise before implementing retrieval or recommendation logic.

## Role-based information architecture to prototype

- Applicant/member: application or profile, status, introductions, feedback, privacy, support.
- Matchmaker: review queue, people, clients, search, shortlists, introductions, tasks, safety escalation.
- Administrator (Jenny/Argent owner): a separate operational web workspace for campaigns, content approvals, staff/access, audit, providers, operations, and pricing. It is not exposed as public or member navigation.
- Partner: approved campaign preview and aggregate reporting only for the pilot.
