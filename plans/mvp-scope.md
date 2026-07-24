# Private-Beta Scope

## Delivery milestones

### Milestone A — Operational alpha

Use synthetic data to validate a responsive staff web workflow for one campaign, application intake, manual review, deterministic search, human shortlists, mutual approval, and introduction follow-up. Verification, scheduling, contracts, payments, and introduction delivery may use documented manual procedures.

### Milestone B — Consenting service pilot

Use a small, explicitly consenting cohort after security/privacy/legal gates. Run one bounded campaign with aggregate-only partner reporting, email-first communications, manual service agreements/payments, and measured matchmaker operations.

### Milestone C — Private beta

Add governed AI assistance and selected Flutter accepted-member workflows after the human service model and operating process are validated.

### Milestone D — Expansion

Consider SMS, broader mobile, integrated billing, multiple campaigns/providers, and purpose-specific person-level partner access only after evidence and separate approval.

Consent alone is not a substitute for security, privacy, legal, retention, access, and incident-readiness gates.

## P0 capabilities

### Public and applicant

- Campaign-specific landing page with approved Argent/partner branding.
- Anyone-can-apply form with clear eligibility and consent.
- Secure account or resumable application mechanism.
- Profile questions, preferences, photos, and document uploads.
- Campaign invite codes and attribution.
- Submission confirmation and understandable status.
- Withdraw application and request deletion.

### Argent operations

- Staff authentication and least-privilege authorization.
- Applicant review queue with explicit status transitions.
- Interview, verification, and internal-note workflows.
- Candidate/client profile management.
- Search and filtering across approved profile fields.
- Shortlists and human-reviewed match recommendations.
- Mutual approval before an introduction.
- Feedback, follow-up, safety flags, and outcome tracking.
- Immutable audit history for consequential and administrative actions.

### Campaigns

- Campaign creation and lifecycle.
- Controlled logo, imagery, copy, geography, dates, quotas, and invite rules.
- Waitlist behavior.
- Referral/source attribution.
- Aggregate-only partner reporting for the pilot without person-level access.

### Platform

- Responsive web application.
- Flutter iOS and Android remain a committed direction but do not block the operational alpha or consenting service pilot.
- Dockerized API, web, worker, and local dependencies.
- Production-like staging environment.
- Observability, backups, restore testing, incident response, and release controls.

### AI

- Draft application summary.
- Missing-information and follow-up-question suggestions.
- Explainable candidate retrieval and match suggestions.
- Human review, edit, override, and audit.
- Evaluation set, red-team cases, model/prompt versioning, and cost monitoring.

## P1 after private-beta proof

- More sophisticated mobile workflows and push notifications.
- Additional campaign templates and reporting.
- Consent-based collaboration with approved matchmakers.
- Coaching, photography, or concierge service workflows.
- Integrated verification providers after the manual/provider boundary is validated.
- Scheduling and billing integrations.
- Carefully governed profile imports/exports.

## Explicit non-goals for the first beta

- General-purpose multi-tenant or self-service white-label SaaS.
- Public profile browsing, swiping, likes, follower counts, or popularity scores.
- Open person-to-person messaging before an approved introduction.
- Fully autonomous matching or automatic introductions.
- Automatic admission or rejection based on AI.
- Inferring protected, sensitive, psychological, or biometric traits from photos.
- Paid placement in matching results.
- Cross-company database federation without contracts, consent, audit, and security review.
- International launch before jurisdiction, residency, and operational requirements are understood.
- Building custom identity, payment, background-check, email, SMS, or push infrastructure when a vetted provider is appropriate.

## Release gates

- Product owner approves beta workflow and success metrics.
- Privacy counsel reviews consent, notices, deletion, retention, screening, and partner terms.
- Security threat model is approved and P0 mitigations are implemented.
- Restore, incident-response, and access-revocation exercises pass.
- AI evaluation thresholds and prohibited-use tests pass.
- Accessibility and representative-device testing pass.
- Load tests support the documented beta envelope.
- Support ownership and escalation coverage are named.
- Every ticket assigned to the release milestone is `Done` with evidence.

## Open assumptions

- Argent intends to operate the platform and control access; qualified counsel must determine the parties' legal roles from actual processing purposes and contracts.
- The first campaign is proposed for an adult Santa Barbara County cohort; age gating, service-area evidence, and inclusive eligibility language remain Phase 0 decisions.
- The web application is the primary application surface.
- Flutter mobile initially focuses on accepted candidates/clients, not full staff administration.
- Argent staff make final admission, verification, matching, and introduction decisions.
- PostgreSQL is the initial system of record unless an ADR establishes otherwise.
