# Conceptual Data Model

## Modeling principles

- A person is represented once, even when they enter through multiple campaigns.
- Authentication identity, person record, application, profile, client relationship, and campaign membership are distinct.
- Sensitive and operational data are separated by purpose and access policy.
- Derived AI output never overwrites human-authored or source data.
- Consequential changes preserve actor, timestamp, reason, previous state, and request correlation.
- Deletion and retention behavior are defined per data class, not improvised per table.

## Core entities

| Entity | Purpose | Key lifecycle/ownership notes |
| --- | --- | --- |
| `UserAccount` | Authentication identity and session controls | May link to a person or staff member; no domain role implied by account alone |
| `Person` | Deduplicated real-world individual | Restricted identifiers; survives multiple applications when legally required |
| `Profile` | Matchmaking-relevant information and preferences | Versioned; visibility and provenance per field where needed |
| `Application` | A submission for consideration | Belongs to a person and entry source; drives admission lifecycle |
| `ApplicationAnswer` | Versioned structured/form response | Stores schema version and source |
| `Campaign` | Controlled Argent recruiting initiative | Has branding, rules, geography, dates, quotas, and partner permissions |
| `CampaignMembership` | Person/application relationship to a campaign | Prevents duplicate people and records attribution |
| `InviteCode` | Controlled campaign/referral access or attribution | Has scope, limits, expiration, issuer, and use history |
| `Referral` | Attributed source relationship | Never grants profile access by itself |
| `ClientEngagement` | Paying-client service relationship | Separate from candidate-network acceptance |
| `ServiceOffering` | Approved package and non-guaranteed service definition | Versioned price/duration/inclusions and jurisdiction |
| `EngagementAgreement` | Accepted commercial terms | Links exact offering/terms version and effective dates |
| `ServiceEntitlement` | What the engagement may receive | Tracks limits without changing match ranking |
| `ServiceFulfillment` | Human/system delivery evidence | Supports operations, disputes, and completion |
| `ReferralAgreement` | Approved referral/affiliate terms | Compensation, disclosure, scope, and dates |
| `CandidateMembership` | Acceptance into Argent's candidate network | Has status, visibility, review, and expiration/refresh policy |
| `StaffMember` | Argent operator identity | Roles granted explicitly and reviewed periodically |
| `PartnerOrganization` | Approved campaign collaborator | Not a tenant and does not own Argent records |
| `PartnerAccessGrant` | Object/scope-specific partner permission | Time-bounded, revocable, and audited |
| `Interview` | Scheduled/completed screening interaction | Notes and recordings have distinct consent and retention |
| `VerificationCase` | Provider-neutral verification workflow | Records checks performed, result class, expiration, and provenance |
| `SafetyCase` | Restricted report or concern | Highly limited access, escalation, and retention policy |
| `MatchCriteria` | Hard constraints and soft preferences | Versioned; distinguishes required, preferred, and unknown |
| `MatchRecommendation` | Human or AI-assisted candidate pairing | Stores rationale, evidence, model/version, and review state |
| `Shortlist` | Matchmaker-curated candidate set | Owned by an engagement and versioned |
| `Introduction` | Permissioned proposed/completed introduction | Separate approval state for each participant |
| `InteractionFeedback` | Post-introduction/date feedback | Visibility rules prevent inappropriate disclosure |
| `RelationshipOutcome` | Coarse outcome and follow-up state | Data-minimized and not treated as universal compatibility truth |
| `ConsentRecord` | Specific permission and notice acceptance | Versioned, revocable, purpose-bound, and auditable |
| `PrivacyRequest` | Access, correction, withdrawal, export, or deletion | Tracks verification, deadlines, fulfillment, and exceptions |
| `CommunicationPreference` | Channel and purpose consent | Separate transactional and marketing purposes |
| `Notification` | Delivery intent and state | Payload minimized; provider IDs and retries tracked |
| `MediaAsset` | Private photo/document metadata | Object key, owner, purpose, scan state, access policy, and retention |
| `AIArtifact` | Generated summary/recommendation/evaluation | Immutable input references, output, versions, review, and disposition |
| `AIExecutionAttempt` | One provider/model execution | Input classification, versions, latency, cost, outcome, and correlation |
| `AIEvaluationResult` | Evaluation of an artifact or model version | Fixture/rubric version, scores, zero-tolerance failures, reviewer |
| `AuditEvent` | Append-only consequential action record | Separate restricted store and retention policy |
| `StateTransitionEvent` | Historical lifecycle transition | Aggregate, previous/next state, actor, policy, reason, and effects |
| `DataAssertion` | Field-level provenance/lineage node | Subject, value reference, source artifact, actor, method, purpose, verification, supersession |
| `CampaignContentRevision` | Versioned campaign copy/configuration | Draft, review, approval, publish, supersede, withdrawal |
| `BrandAsset` | Approved logo/photo/design asset | Rights, owner, expiry, accessibility metadata, and revision |
| `FormSchemaVersion` | Exact application questions and validation shown | Immutable once used by a submission |
| `ConsentNoticeVersion` | Exact notice and choices shown | Immutable, locale-aware, and purpose-specific |
| `MessageTemplateVersion` | Approved transactional/marketing copy | Channel, purpose, approval, and active dates |
| `PolicyDocument` | Versioned service/privacy/safety terms | Approval, jurisdiction, effective date, and supersession |
| `AttributionTouch` | Immutable campaign/referral entry evidence | First/later touch, issuer, session/source, rule version, and consent |
| `AnalyticsEvent` | Privacy-reviewed product measurement event | Versioned schema, event/subject IDs, occurrence/receipt times, deletion link |
| `MetricDefinition` | Authoritative metric contract | Grain, formula, cohort, window, dimensions, owner, and source lineage |
| `DataQualityIssue` | Detected inconsistency requiring remediation | Rule, severity, object, state, owner, and resolution evidence |
| `OutboxEvent` | Transactionally recorded domain event | Aggregate/order key, schema version, delivery and replay state |
| `WebhookReceipt` | Verified incoming provider message | Provider ID, signature result, deduplication, timestamps, reconciliation |
| `JobExecution` | Durable asynchronous attempt | Job class, idempotency, retry, cancellation, quarantine, and outcome |

## Important relationships

- `Person 1—N Application`
- `Application N—1 Campaign` where applicable
- `Person N—M Campaign` through `CampaignMembership`
- `Person 0—1 CandidateMembership`
- `Person 0—N ClientEngagement`
- `ClientEngagement 1—N MatchCriteria`
- `MatchRecommendation` links two people plus the requesting engagement and reviewer
- `Introduction` references one approved recommendation/shortlist context and two independent participant decisions
- `ConsentRecord` references a person, purpose, notice version, capture context, and optional campaign
- `AIArtifact` references source versions without becoming their source of truth
- `AttributionTouch` preserves the touchpoint chain without overwriting first-touch evidence
- `AnalyticsEvent`, `AuditEvent`, security telemetry, and raw provider payloads are separate systems/schemas
- Every submission retains the exact campaign content, form schema, notice, and policy versions presented
- `DataAssertion` links source artifacts and transformations to downstream profile fields without overwriting history

## Data classification

Proposed classes:

- `PUBLIC`: approved campaign and marketing content.
- `INTERNAL`: operational configuration without personal data.
- `CONFIDENTIAL`: ordinary profile and business information.
- `SENSITIVE`: identity, private preferences, media, communications, verification, and precise location.
- `HIGHLY_RESTRICTED`: safety cases, screening details, legal requests, credentials, and certain staff notes.

Every field must have an owner, purpose, classification, allowed roles, retention rule, and logging rule before production use.

Raw verification/provider payloads are quarantined with narrow access and retention, then minimized into provider-neutral domain results. They do not enter analytics or AI by default.

## Location handling

Geographic campaigns should prefer coarse eligibility evidence, such as county or service radius, rather than continuous or historical location tracking. Exact home addresses are not required for campaign eligibility and should not be collected without a separate operational purpose.

## Data-quality requirements

- Deterministic and reviewed duplicate resolution.
- Provenance for imported, applicant-entered, staff-entered, partner-entered, provider-returned, and AI-derived values.
- `unknown` distinct from `false`, `none`, and `not applicable`.
- Versioned application schemas and match criteria.
- Expiration/refresh rules for stale preferences, photos, verification, and availability.
- Quarantine and review for conflicting or suspicious provider data.

Operational data-quality rules require a severity, owner, detection cadence, freshness target, remediation state, and evidence. Initial rules cover duplicates, conflicting consent, stale profiles, orphaned media, unmatched callbacks, invalid campaign memberships, impossible lifecycle transitions, and failed deletion propagation.

## Commerce boundary

The consenting pilot may keep payment processing off-platform, but it still records agreement, entitlement, fulfillment, cancellation, and dispute status without storing card data. If integrated billing is approved later, add provider-neutral invoices, payments, refunds, disputes, reconciliation events, and entitlement effects through a separate ADR and tickets.
