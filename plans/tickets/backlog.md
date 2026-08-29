# Argent Delivery Backlog

The ordered source for import and reporting is [backlog.csv](backlog.csv). This checklist is the human-readable phase view.

When a ticket moves to `Ready`, copy [the ticket template](../templates/ticket.md) to `plans/tickets/ARG-###-short-name.md`. Update that file during implementation. A checkbox below is checked only after the ticket is `Done` under [the Definition of Done](../delivery.md).

- [x] `ARG-000` Establish the planning and delivery foundation.

## Phase 0 — Decisions and validation

- [x] `ARG-001` Approve product brief, ICP, service model, and success measures.
- [ ] `ARG-002` Research founder and matchmaker operating workflows.
- [ ] `ARG-003` Test applicant, candidate, and client concepts and language.
- [ ] `ARG-004` Approve Nocturne brand and cross-platform design direction.
- [ ] `ARG-005` Approve admission, candidate, client, and campaign lifecycles.
- [ ] `ARG-006` Complete privacy/legal requirements assessment.
- [ ] `ARG-007` Complete threat model and data-flow diagrams.
- [ ] `ARG-008` Complete external provider and API feasibility matrix.
- [ ] `ARG-009` Approve private-beta plan and go/no-go metrics.
- [ ] `ARG-010` Validate service model, pricing, pilot economics, and non-guarantees.
- [ ] `ARG-011` Define pilot hypothesis, cohort, metric catalog, and decision thresholds.
- [ ] `ARG-012` Produce and test the end-to-end service blueprint.
- [ ] `ARG-013` Approve independent lifecycle and status communication policies.
- [ ] `ARG-014` Approve invite, referral, eligibility, quota, and waitlist policy.
- [ ] `ARG-015` Approve aggregate-only pilot partner data boundary.
- [ ] `ARG-016` Approve luxury brand, inclusive content, and trust-claims system.
- [ ] `ARG-017` Decide pilot commerce, contracts, refunds, and referral economics.
- [ ] `ARG-018` Prototype and test first-time application and consent.
- [ ] `ARG-019` Approve API evolution and supported-mobile compatibility policy.
- [ ] `ARG-020` Approve AI use-case contracts and evaluation gates.
- [ ] `ARG-021` Approve analytics event, attribution, and metric architecture.
- [ ] `ARG-022` Complete processing, retention, rights, and subprocessor register.
- [ ] `ARG-023` Approve content, taxonomy, rights, and publishing governance.
- [ ] `ARG-024` Establish requirement-to-delivery traceability.
- [ ] `ARG-025` Assign launch RACI and critical-risk ownership.
- [ ] `ARG-026` Complete match-science evidence review, construct register, and prospective validation plan.
- [ ] `ARG-027` Prototype and test optional structured, conversational, and hybrid intake.
- [ ] `ARG-028` Evaluate on-device and server speech recognition for privacy, accuracy, cost, and accessibility.
- [x] `ARG-029` Enforce workflow authority, readiness, and the single-WIP delivery rule.
- [x] `ARG-030` Approve shared human-research authorization controls.
- [ ] `ARG-031` Validate target-buyer problem intensity, authority, and commitment.

## Phase 1 — Repository, platform, and trust foundation

- [ ] `ARG-100` Configure Git remote, branch protections, CI reviewers, and PR workflow.
- [x] `ARG-101` Scaffold the TypeScript/Flutter monorepo and module boundaries.
- [x] `ARG-102` Establish OpenAPI contracts and generated TypeScript/Dart clients.
- [x] `ARG-103` Build the reproducible Docker development environment.
- [x] `ARG-104` Establish CI quality, test, secret, dependency, and container gates.
- [ ] `ARG-105` Select the cloud/deployment approach and provision staging.
- [ ] `ARG-106` Establish environment configuration and managed secrets.
- [x] `ARG-107` Establish database migrations, seed data, and synthetic fixtures.
- [ ] `ARG-108` Establish structured logs, metrics, traces, redaction, and alerts.
- [ ] `ARG-109` Establish backups, point-in-time recovery, and restore reconciliation.
- [ ] `ARG-110` Establish durable job processing, retries, and dead-letter recovery.
- [ ] `ARG-111` Establish feature flags and safe deployment/rollback controls.
- [x] `ARG-112` Implement transactional outbox, webhook inbox, and job registry.
- [ ] `ARG-113` Harden production containers and singleton migration execution.
- [ ] `ARG-114` Establish privacy-safe analytics event pipeline.
- [ ] `ARG-115` Establish data-quality monitoring and reconciliation.
- [ ] `ARG-116` Define production topology, SLOs, capacity envelope, and scaling policy.
- [x] `ARG-117` Establish documentation governance and drift checks.
- [x] `ARG-118` Establish cross-platform design tokens and foundational components.
- [x] `ARG-119` Report safe next development work from the backlog.
- [x] `ARG-120` Build a synthetic, interactive public, applicant, and matchmaker concept prototype.
- [ ] `ARG-121` Build a synthetic, private Candidate Discovery Map for matchmaker review.
- [ ] `ARG-122` Build the accessible component and interaction-state foundation.
- [ ] `ARG-201` Integrate authentication, MFA, recovery, and session management.
- [ ] `ARG-202` Implement deny-by-default RBAC and object-scoped authorization.
- [ ] `ARG-203` Implement staff administration and privileged-access review.
- [ ] `ARG-204` Implement controlled partner access grants.
- [ ] `ARG-205` Implement append-only consequential audit events.
- [ ] `ARG-206` Implement consent and notice versioning.
- [ ] `ARG-207` Implement privacy requests and deletion/withdrawal orchestration.
- [ ] `ARG-208` Implement private uploads, scanning, metadata stripping, and signed access.
- [ ] `ARG-209` Implement public endpoint abuse, rate-limit, and invite-code protections.
- [ ] `ARG-210` Implement communication preferences and purpose-specific consent.
- [ ] `ARG-211` Establish security incident and break-glass workflows.
- [ ] `ARG-212` Implement consent-withdrawal propagation and use invalidation.
- [ ] `ARG-213` Implement partner-access recertification and emergency revocation.
- [ ] `ARG-214` Implement intake moderation, impersonation reporting, and safety escalation.

## Phase 2 — Campaign and application intake

- [ ] `ARG-301` Implement campaign lifecycle and configuration.
- [ ] `ARG-302` Implement controlled campaign branding and preview/approval.
- [ ] `ARG-303` Implement coarse geographic eligibility rules.
- [ ] `ARG-304` Implement invite codes, referral attribution, limits, and expiry.
- [ ] `ARG-305` Implement campaign quotas, waitlist, pause, and closure.
- [ ] `ARG-306` Implement campaign-specific questions with schema versioning.
- [ ] `ARG-307` Implement aggregate partner campaign reporting.
- [ ] `ARG-308` Implement campaign closure, access review, and retention actions.
- [ ] `ARG-309` Implement public campaign landing pages and accessibility states.
- [ ] `ARG-310` Implement campaign analytics with privacy-safe attribution.
- [ ] `ARG-311` Implement versioned campaign content and publishing workflow.
- [ ] `ARG-401` Implement account creation and resumable applications.
- [ ] `ARG-402` Implement core application form and review-before-submit.
- [ ] `ARG-403` Implement profile media and document uploads.
- [ ] `ARG-404` Implement duplicate-person detection and review.
- [ ] `ARG-405` Implement applicant lifecycle and policy-controlled transitions.
- [ ] `ARG-406` Implement staff review queue and information requests.
- [ ] `ARG-407` Implement interview scheduling, notes, and recording consent.
- [ ] `ARG-408` Integrate identity/verification workflow behind a provider boundary.
- [ ] `ARG-409` Implement applicant status, support, withdrawal, and correction.
- [ ] `ARG-410` Implement transactional email/SMS notification delivery.
- [ ] `ARG-411` Implement accepted candidate/client onboarding and terms.
- [ ] `ARG-412` Implement admission communication, correction, and appeal.
- [ ] `ARG-413` Integrate automated verification provider after pilot validation.
- [ ] `ARG-414` Add SMS messaging after consent and channel-value validation.

## Phase 3 — Matchmaking operations

- [ ] `ARG-501` Implement candidate and client profiles with field provenance.
- [ ] `ARG-502` Implement hard constraints, soft preferences, and unknown values.
- [ ] `ARG-503` Implement permission-aware candidate search and filters.
- [ ] `ARG-504` Implement saved searches and shortlist collaboration.
- [ ] `ARG-505` Implement human-authored match recommendations and rationale.
- [ ] `ARG-506` Implement independent mutual introduction approval.
- [ ] `ARG-507` Implement controlled introduction delivery and status.
- [ ] `ARG-508` Implement date feedback, follow-up tasks, and visibility rules.
- [ ] `ARG-509` Implement relationship outcomes and availability refresh.
- [ ] `ARG-510` Implement reporting, blocking, safety cases, and escalation.
- [ ] `ARG-511` Implement audited support and administrative recovery tools.
- [ ] `ARG-512` Implement moderation, takedown, dispute, and evidence governance.

## Phase 4 — Governed AI assistance

- [ ] `ARG-601` Establish AI provider policy, gateway boundary, and kill switches.
- [ ] `ARG-602` Implement structured application summaries with evidence.
- [ ] `ARG-603` Implement missing/conflicting-information assistance.
- [ ] `ARG-604` Implement source-grounded interview-question suggestions.
- [ ] `ARG-605` Implement deterministic filtering plus explainable candidate retrieval.
- [ ] `ARG-606` Implement human-reviewed AI match suggestions.
- [ ] `ARG-607` Build AI evaluation fixtures, rubrics, and launch thresholds.
- [ ] `ARG-608` Build prohibited-inference, privacy-leakage, and injection tests.
- [ ] `ARG-609` Implement model/prompt/version/cost/latency observability.
- [ ] `ARG-610` Implement AI edit, override, disposition, and audit history.
- [ ] `ARG-611` Enforce consent, authorization, and provenance at AI execution time.
- [ ] `ARG-612` Implement AI sampling, drift detection, quarantine, and rollback.
- [ ] `ARG-613` Implement optional conversational intake with transcript correction and field-by-field approval.

## Phase 5 — Flutter member experience

- [ ] `ARG-701` Scaffold Flutter architecture, environments, and generated client.
- [ ] `ARG-702` Implement secure mobile authentication and session controls.
- [ ] `ARG-703` Implement accepted-member profile, consent, and privacy controls.
- [ ] `ARG-704` Implement introduction request and approve/decline workflows.
- [ ] `ARG-705` Implement privacy-safe push notifications and preferences.
- [ ] `ARG-706` Implement feedback, follow-up, support, and safety workflows.
- [ ] `ARG-707` Implement mobile accessibility, analytics, crash redaction, and QA.
- [ ] `ARG-708` Complete App Store/Play privacy, signing, beta, and release pipelines.

## Phase 6 — Launch readiness and controlled beta

- [ ] `ARG-801` Complete end-to-end responsive and accessibility verification.
- [ ] `ARG-802` Complete authorization, abuse, and negative-path test suite.
- [ ] `ARG-803` Complete beta capacity model and performance/load tests.
- [ ] `ARG-804` Complete independent penetration test and remediation.
- [ ] `ARG-805` Complete privacy/legal and partner-contract launch review.
- [ ] `ARG-806` Complete backup restore and consent/deletion reconciliation exercise.
- [ ] `ARG-807` Complete incident-response and provider-outage tabletop exercises.
- [ ] `ARG-808` Run synthetic end-to-end operational rehearsal.
- [ ] `ARG-809` Run a small explicitly consenting usability beta.
- [ ] `ARG-810` Configure Montecito/Santa Barbara controlled campaign.
- [ ] `ARG-811` Conduct production go/no-go review and launch.
- [ ] `ARG-812` Monitor campaign and complete post-launch retrospective.
