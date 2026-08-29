# Independent Specialist Findings

## Status and interpretation

This file normalizes independent read-only specialist reviews. Findings are
review inputs, not approved plan changes or backlog work. IDs are local to this
audit. Severity reflects the reviewer's proposed release impact and remains
subject to consolidation and owner review.

## Wave 1 — System foundations

### Staff systems architecture

Overall assessment: the modular-monolith direction, worker isolation,
transactional delivery intent, generated contracts, synthetic-data boundary,
human-controlled AI, and consent/provenance model are strong. The primary risk
is drift between those accepted boundaries and later synthetic prototypes.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| SA-01 | P0 | Browser Client Components import the server-designated domain package, so the accepted API/client boundary is no longer true. | `plans/adrs/ADR-014-package-boundaries.md:36-40`; `plans/tickets/ARG-101-platform-foundation.md:38-42`; `apps/web/src/app/prototype/interview/adaptive-interview.tsx:1-7`; `apps/web/src/app/prototype/interview/structured-interview.tsx:1-7`; `apps/web/package.json:12-15`; `packages/domain/src/index.ts:70-99` | Reopen the narrow ARG-101 claim or add a remediation ticket; define the production API authority and enforce import/bundle boundaries in CI. |
| SA-02 | P0 | The separately deployable admin image is omitted from container scanning and SBOM coverage. | `plans/architecture.md:54-58`; `infra/docker/Dockerfile:41-49`; `compose.yaml:45-67`; `.github/workflows/containers.yml:4-17,62-67`; `plans/tickets/ARG-104-ci-security.md:40-46,62-64` | Narrow regression remediation for ARG-104 or a dedicated ticket; add admin paths and scan target, then validate target parity. |
| SA-03 | P0 | Domain modules and entities are listed without mutation ownership, dependency rules, or cross-module transaction contracts. | `plans/architecture.md:77-92`; `plans/data-model.md:12-75`; `plans/adrs/ADR-001-modular-monolith.md:44-50`; `plans/tickets/backlog.csv:7` | Expand ARG-005/013 acceptance artifacts before persistent ARG-501/615 work. |
| SA-04 | P1 | Durable event mechanics lack a governed domain-event catalog, compatibility lifecycle, replay authorization, and reconciliation contract. | `plans/architecture.md:127-138`; `plans/adrs/ADR-012-transactional-event-delivery.md:60-77`; `plans/tickets/ARG-112-event-delivery-foundation.md:45-52`; `plans/tickets/backlog.csv:41` | Extend ARG-110 or add a domain-event contract ticket; do not duplicate the completed outbox/inbox foundation. |
| SA-05 | P1 | “Append-only” and “immutable” audit history lack tamper, write-failure, retention, restore, capacity, and reconciliation semantics. | `plans/mvp-scope.md:37-45`; `plans/data-model.md:60-61`; `plans/security-privacy.md:174-185`; `plans/tickets/backlog.csv:57` | Expand ARG-205 with durability and failure acceptance; coordinate deletion/legal-hold rules under ARG-022/207. |
| SA-06 | P1 | No end-to-end dependency failure/degradation matrix defines truthful behavior during IdP, database, queue, storage/scanner, notification, AI, or telemetry failure. | `plans/architecture.md:188-198`; `plans/operations.md:5-13,29-47`; `plans/tickets/backlog.csv:36-47` | Make one shared resilience matrix an acceptance artifact for ARG-105/109-111/116. |
| SA-07 | P2 | Decision records have stale or ambiguous states, including separate admin and the synthetic-versus-production ARG-613/ADR-020 boundary. | `plans/decisions.md:24,41,51`; `plans/architecture.md:54-58`; `plans/tickets/ARG-613-conversational-intake-implementation.md:6-12,37-53` | Reconcile under ARG-024/117 and clarify which production behaviors each ADR gates. |

Architecture strengths to preserve:

- Appropriate modular monolith and extraction criteria.
- Explicit sync/async and risk-isolated worker boundaries.
- Strong outbox/inbox and idempotency foundation.
- Generated TypeScript/Dart contract and compatibility policy.
- Comprehensive provenance, consent, classification, and deletion intent.
- Deliberate campaign isolation instead of premature multi-tenancy.
- Honest production-topology, SLO, recovery, and persistence gates.

### Security, reliability, and QA

Overall assessment: the plan treats security, recovery, consent invalidation,
and launch exercises as architectural gates. Most capabilities exist in the
backlog, but ownership enforcement, milestone-specific assurance, measurable
support matrices, detection scope, and resilience acceptance need sharpening.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| SQ-01 | P0 | Critical security ownership is policy-stated but not enforced by ticket dependencies or the validator. | `plans/delivery.md:62-77`; `plans/risks.md:7-9,23-24,51-57`; `plans/tickets/backlog.csv:27,53-57,61,63` | Activate ARG-025 before real-data security work and fail readiness when owners/reviewers/risk authority are unassigned. |
| SQ-02 | P0 | The consenting web/service pilot and later AI/mobile private-beta assurance gates are coupled into one release train. | `plans/delivery.md:5-19`; `plans/mvp-scope.md:106-115`; `plans/tickets/backlog.csv:130,136-137`; `plans/risks.md:14` | Split web/admin/API pilot assurance from conditional AI/mobile gates. |
| SQ-03 | P1 | Accessibility and browser/device assurance lack a versioned support and critical-journey matrix. | `plans/mvp-scope.md:94-104`; `plans/delivery.md:122-136`; `plans/tickets/backlog.csv:130`; `package.json:10-31`; `.github/workflows/quality.yml:17-51` | Expand/split ARG-801 with automated and manual web/admin/mobile evidence. |
| SQ-04 | P1 | Security-test and penetration-assessment scope is ambiguous beyond general authorization/abuse language. | `plans/tickets/backlog.csv:131,133`; `plans/security-privacy.md:25-35`; `.github/workflows/security.yml:33-50`; `package.json:13-31` | Add a threat-to-test matrix to ARG-802 and explicit independent assessment/retest scope to ARG-804. |
| SQ-05 | P1 | Detection engineering is less concrete than prevention and recovery planning. | `plans/architecture.md:200-206`; `plans/security-privacy.md:161-172`; `plans/operations.md:29-47`; `plans/tickets/backlog.csv:39,57,63` | Add a minimum tested detection catalog across ARG-108/205/211. |
| SQ-06 | P1 | Capacity planning does not require spike, soak, saturation, failure injection, priority isolation, or recovery evidence. | `plans/operations.md:82-93`; `plans/architecture.md:188-198`; `plans/tickets/backlog.csv:132` | Expand ARG-803 into a resilience and capacity envelope, preserving privacy/safety priority. |
| SQ-07 | P2 | Release supply-chain evidence retention and vulnerability operations are underspecified. | `plans/architecture.md:151-155`; `.github/workflows/containers.yml:83-107`; `plans/tickets/ARG-104-ci-security.md:49-54`; `plans/security-privacy.md:7-13` | Expand ARG-113 with signed digests, attestations, retained release SBOMs, remediation SLAs, and exception expiry. |

Security strengths to preserve:

- Security/privacy as explicit launch gates.
- Deny-default identity, MFA, session revocation, privileged review, and
  break-glass intent.
- Concrete downstream consent-withdrawal invalidation.
- Backup/restore, rollback, migration, and tabletop coverage.
- Strong transactional delivery and poison-message runbook boundaries.
- Pinned/scanned CI foundation with secret, dependency, CodeQL, image, and
  SBOM checks.

Do not duplicate existing tickets for outbox/inbox, deployment,
authentication/RBAC, observability, backup/restore, incident exercises,
accessibility, capacity, or penetration testing; strengthen their acceptance
artifacts and release sequencing.

### Trust, privacy, rights, safety, and governance

Overall assessment: Argent's trust principles are stronger than most early
plans. The gaps are operational policy matrices, accountable owners, workflow
state machines, SLAs, and executable evidence—not missing privacy intent.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| TP-01 | P0 | Participant recruitment lacks an approved research-data inventory, retention/deletion process, withdrawal channel/SLA, and safety escalation owner. | `plans/research/research-operations-runbook.md:60-82`; `plans/research/consent-and-session-script.md:43-47`; `plans/research/session-materials/ARG-617-moderator-guide.md:7-17,202-208` | Add one shared pre-recruitment research data and safety operations gate; do not treat protocol approval as outreach authorization. |
| TP-02 | P0 | The synthetic permission check lacks subject/object/action, campaign/client/partner scope, policy version, current grant validity, and reason-coded denial needed for real data. | `plans/data-model.md:40-52,111-123`; `packages/domain/src/candidate-intelligence.ts:10-40,272-299`; `plans/tickets/ARG-615-candidate-intelligence-data-contract.md:18-27,75-79` | Expand ARG-204/206/212/615 around one versioned permission-decision contract. |
| TP-03 | P0 | Critical trust risks have no named accountable people, deputies, review dates, or residual-risk authority, and ARG-025 is sequenced too late. | `plans/security-privacy.md:7-13`; `plans/risks.md:7-9,23-24,35-57`; `plans/tickets/backlog.csv:27` | Re-sequence ARG-025 as an immediate planning prerequisite before real-person or real-data work. |
| TP-04 | P1 | Sensitive romantic data needs a versioned field-policy registry rather than one broad candidate-approved classification. | `plans/conversational-intake.md:74-83`; `plans/data-model.md:111-123`; `packages/domain/src/candidate-intelligence.ts:62-90`; `plans/experience.md:51-68` | Expand ARG-022/023/615 with per-field collection, visibility, AI/index/analytics/export, retention, and redaction policy. |
| TP-05 | P1 | Withdrawal/deletion intent lacks an authoritative propagation graph with SLA, retry, tombstone, legal-hold, aggregate, receipt, and restore behavior. | `plans/security-privacy.md:92-125`; `plans/metrics.md:86-96`; `plans/tickets/ARG-615-candidate-intelligence-data-contract.md:60-62`; `plans/tickets/backlog.md:70-76,160-162` | Make the graph the ARG-207/212 acceptance artifact and exercise it under ARG-806. |
| TP-06 | P1 | Aggregate partner reporting needs differencing/composition, overlapping-cohort, dimension, rate, and export controls beyond minimum cohort size. | `plans/experience.md:101-118`; `plans/security-privacy.md:127-137`; `packages/domain/src/candidate-dashboard-access.ts:49-83,164-197`; `plans/tickets/backlog.csv:73-76` | Expand ARG-114/307/310 with composable disclosure controls and synthetic re-identification challenges. |
| TP-07 | P1 | Safety, moderation, takedown, dispute, and appeal capabilities lack one coherent trust-case taxonomy and state model. | `plans/security-privacy.md:147-166`; `plans/experience.md:23-29`; `plans/tickets/backlog.md:77,103,118-120` | Add a shared contract as an acceptance dependency for ARG-214/412/510/512. |
| TP-08 | P2 | Audit governance lacks tamper evidence, reader separation, access logging, clock integrity, legal hold, and completeness reconciliation. | `plans/data-model.md:3-10,56-61`; `plans/security-privacy.md:15-23,127-137` | Expand ARG-205/211 rather than add a parallel capability. |
| TP-09 | P2 | Policy-change compatibility and re-consent behavior is implicit, and consent comprehension is not measured. | `plans/data-model.md:63-68`; `plans/experience.md:68`; `plans/content-model.md:19-33` | Expand ARG-206/210 with compatible/narrowed/broadened change rules and synthetic comprehension tests. |

Trust strengths to preserve:

- Purpose-specific, unbundled consent and separate voice controls.
- Broad withdrawal invalidation across caches, queues, indexes, providers,
  exports, backups, and AI artifacts.
- Explicitly assistive AI with strong prohibited-inference rules.
- Provenance-preserving AI artifacts and accepted-human-version separation.
- Purpose-specific, expiring, revocable partner access and aggregate-only pilot.
- Strict separation of analytics, audit, security telemetry, operations, and
  provider payloads.

Correctly gated rather than missing: real persistence and identity resolution,
production RBAC, person-level partner access, speech/provider selection,
compatibility prediction, autonomous introduction, legal review, threat model,
restore and incident exercises.

## Wave 2 — Intelligence and data

### AI system architecture and evaluation

Overall assessment: product boundaries, provenance, applicant control, and
consequential-automation prohibitions are strong. Provider-backed AI is not
implementation-ready because decision ownership, evaluation, execution-envelope
security, evidence schemas, model lifecycle, subgroup methods, and reviewer
operations remain specifications rather than executable systems.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| AI-01 | P0 | ADR-009 and ADR-016 overlap on provider, evaluation, workflow, tool, data, and authorization control without one approval path or registry. | `plans/decisions.md:40,47`; `plans/architecture.md:224`; `plans/ai-governance.md:134-151`; `plans/tickets/backlog.csv:22,104-115` | Clarify or merge ADR scopes; make ARG-020 the authoritative use-case registry and prerequisite for provider-backed work. |
| AI-02 | P0 | Evaluation requirements are a checklist, not a reproducible release system with immutable fixtures, adjudication, statistics, thresholds, and signed evidence. | `plans/ai-governance.md:88-115`; `plans/tickets/backlog.csv:110`; `apps/web/src/app/prototype/interview/interview-plan-evaluation.ts:16-40,50-133`; `apps/web/src/app/prototype/interview/interview-output-policy.ts:82-88` | Expand ARG-607 into a detailed evaluation-system ticket; preserve current deterministic tests as foundation evidence only. |
| AI-03 | P0 | Provider-era prompt-injection and exfiltration controls lack a concrete execution envelope, taint model, outbound allowlist, and adversarial matrix. | `plans/ai-governance.md:7,94-103,141-151`; `plans/architecture.md:30`; `apps/web/src/app/prototype/interview/interview-guide.ts:281-358`; `apps/web/src/app/prototype/interview/interview-output-policy.ts:50-180`; `plans/tickets/backlog.csv:111,114` | Put the envelope in ADR-016; strengthen ARG-608/611 with provider-boundary and zero-tolerance evidence. |
| AI-04 | P1 | No canonical claim/evidence/unknown/contradiction schema spans summaries, questions, retrieval, and match suggestions. | `plans/ai-governance.md:66-71,145`; `plans/data-model.md:56-59`; `apps/web/src/app/prototype/interview/interview-output-policy.ts:156-180`; `packages/domain/src/candidate-intelligence.ts:78-89,396-421` | Add provider-neutral proposal/claim-evidence concepts and require ARG-602-606 to use them. |
| AI-05 | P1 | Model/provider/prompt releases lack lifecycle states, immutable alias resolution, canary rules, material-change classification, quarantine propagation, and affected-artifact queries. | `plans/ai-governance.md:126-132,155-162`; `plans/risks.md:37`; `plans/tickets/backlog.csv:112,115`; `packages/domain/src/interview-usage.ts:10-34`; `packages/domain/src/candidate-intelligence.ts:409-419` | Expand ARG-609/612 with a governed release registry and rollback/quarantine state machine. |
| AI-06 | P1 | Subgroup/privacy evaluation lacks lawful label sourcing, minimum cohorts, uncertainty, intersectional review, suppression, and an insufficient-evidence outcome. | `plans/ai-governance.md:90-103`; `plans/conversational-intake.md:85-93`; `plans/match-science.md:107-131` | Add the statistical/privacy protocol to ARG-607/608 without encouraging unnecessary sensitive-label collection. |
| AI-07 | P1 | Human review is a principle, not an operating control with competency, disagreement, escalation, capacity, SLA, sampling, and override taxonomy. | `plans/ai-governance.md:105-124,157-160`; `plans/tickets/backlog.csv:113` | Expand ARG-610; keep consequential decisions human-owned. |
| AI-08 | P2 | High AI risks remain correctly blocked but lack named accountable owners. | `plans/risks.md:9,37,53-57` | Resolve through ARG-025 rather than an AI-specific ownership ticket. |

AI strengths to preserve: assistive-only scope, explicit prohibited inference,
deterministic hard constraints, applicant transcript/field approval, closed
provider-free planner, fail-closed runtime policy, assertion provenance,
content-free cost controls, and the rule that outcomes are selection-biased
rather than training truth.

Do not add a new AI epic or authorize provider activation, real candidate data,
automatic admission/ranking/introduction, or voice without their existing
gates.

### Data and analytics architecture

Overall assessment: privacy semantics and synthetic aggregate contracts are
disciplined, but the authoritative measurement plane—metric registry, event and
fact layers, computation lineage, recomputation/deletion, differencing defense,
and reconciliation—is not approved or implemented.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| DA-01 | P0 | Canonical KPI contracts have not been instantiated even though ARG-617 marks metric-contract definition complete. | `plans/metrics.md:7-41`; `plans/templates/metric.md:1-28`; `plans/product.md:132-149`; `plans/tickets/ARG-617-admin-candidate-analytics.md:19-22`; `plans/reviews.md:32`; `packages/domain/src/candidate-dashboard-metrics.ts:86-197` | Qualify the ARG-617 check as synthetic calculation/display contracts; instantiate authoritative KPI contracts under ARG-021. |
| DA-02 | P0 | ADR-008 and ADR-013 overlap and no approved event→fact→aggregate→snapshot architecture exists. | `plans/decisions.md:39,44`; `plans/tickets/backlog.csv:23,45`; `plans/data-model.md:69-72`; `packages/domain/src/candidate-dashboard-metrics.ts:402-419` | Consolidate or separate ADR scopes before instrumentation; harden ARG-021/114. |
| DA-03 | P0 | Minimum cohort size and an allowed-key list do not prevent differencing, adjacent-window, complementary, or cohort-manipulation disclosure. | `packages/domain/src/candidate-dashboard-metrics.ts:352-373`; `packages/domain/src/candidate-dashboard-access.ts:24-29,64-83`; `plans/security-privacy.md:127-136`; `plans/metrics.md:17-22`; `plans/tickets/ARG-617-admin-candidate-analytics.md:23-25` | Add governed dimensions/cohorts, complementary suppression, stable windows, and repeated-query challenges to ARG-021/617. |
| DA-04 | P0 | Analytics deletion/restore/reconciliation dependencies are miswired. | `plans/metrics.md:86-96`; `plans/security-privacy.md:92-125`; `plans/tickets/backlog.csv:45-46`; `plans/risks.md:20,41` | Add or gate ARG-114 on ARG-109/207/212 and production acceptance on ARG-115; make ARG-115 depend on the pipeline it reconciles. |
| DA-05 | P1 | Identity resolution lacks source identities, merge/split lineage, consent-conflict handling, metric restatement, and an ARG-404 dependency. | `plans/data-model.md:3-10,129-139`; `plans/tickets/ARG-615-candidate-intelligence-data-contract.md:11,18-26`; `plans/tickets/backlog.csv:81` | Add ARG-404 to ARG-615 or make its reviewed merge/split contract an explicit sub-deliverable. |
| DA-06 | P1 | Cumulative workflow observations can place historical stages into the latest observation window because stages lack occurrence times. | `packages/domain/src/candidate-workflow-outcomes.ts:26-43,274-306,336-410`; `plans/metrics.md:67-71`; `plans/match-science.md:59-67` | Define occurrence/cohort anchors, stage timestamps, maturity/censoring, and immutable selection/exposure lineage across ARG-503-509. |
| DA-07 | P1 | Dashboard lineage lacks metric-definition, computation/run, query/code, watermark, revision, backfill, and supersession identifiers. | `packages/domain/src/candidate-dashboard-metrics.ts:943-962`; `plans/metrics.md:20-24` | Add reproducible computation lineage under ARG-021/114/115/617. |
| DA-08 | P1 | One caller-configured freshness threshold is applied to materially different source families. | `packages/domain/src/candidate-dashboard-metrics.ts:355-373,1067-1075`; `plans/metrics.md:20-24` | Version freshness SLA and stale-decision behavior per metric/source. |
| DA-09 | P1 | Assertions and analytics dimensions lack versioned field-policy/taxonomy identity. | `plans/data-model.md:111-123`; `plans/content-model.md:36-46`; `packages/domain/src/candidate-intelligence.ts:62-89`; `packages/domain/src/candidate-purpose-projection.ts:19-37` | Add governed field-definition/policy references before persistence. |
| DA-10 | P2 | Data-quality governance names the right rule attributes but has no executable registry, issue lifecycle, reconciliation contract, or SLO. | `plans/data-model.md:129-139`; `plans/tickets/backlog.csv:46` | Expand ARG-115; do not create a parallel quality platform. |

Data strengths to preserve: separation of people/accounts/applications/profiles,
raw-versus-derived integrity, explicit analytics/audit/security/provider
boundaries, honest missing/unknown/stale semantics, purpose-limited
projections, opportunity rather than person counts, separate outcome
denominators, durable delivery mechanics, and synthetic-only seeding.

Do not add a warehouse, stream processor, search service, scoring system, or
parallel analytics/deletion epic without measured need.

### Domain and content architecture

Overall assessment: conceptual lifecycle separation, versioned consent/content,
source approval, and trust-zone boundaries are strong. The object model needs
aggregate ownership, atomic release composition, stable typed fields, reversible
identity resolution, executable retention, decision snapshots, case isolation,
and localization rules. A generic CMS would be the wrong solution.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| DC-01 | P0 | Lifecycles lack transition contracts, and sequential introduction states contradict two independent participant decisions. | `plans/experience.md:5-29`; `plans/data-model.md:48,102`; `plans/tickets/backlog.csv:7,15`; `packages/domain/src/candidate-workflow-outcomes.ts:18-35` | Replace the introduction chain with aggregate plus two child decision lifecycles; expand ARG-005/013 with transition matrices. |
| DC-02 | P0 | Candidate fields lack stable typed schema identity and assertion IDs can collide across sessions. | `plans/content-model.md:38-46`; `plans/data-model.md:18,27,62`; `packages/domain/src/candidate-intelligence.ts:62-90,183-188`; `plans/tickets/ARG-615-candidate-intelligence-data-contract.md:24-26,58-62` | Define field/option versions, typed values, source artifacts, derivation edges, and collision-safe opaque IDs under ARG-023/501/615. |
| DC-03 | P0 | Independently versioned service content is not composed into an atomic approved release bundle. | `plans/content-model.md:9-25`; `plans/data-model.md:108`; `plans/decisions.md:49`; `plans/tickets/backlog.csv:25,77` | Accept ADR-018 and add an immutable service/campaign release bundle under ARG-023/311. |
| DC-04 | P0 | Person resolution and consent scope lack canonical merge/split/unmerge records and rules. | `plans/data-model.md:5-10,16-19,32-41,86-103`; `plans/risks.md:13`; `plans/tickets/backlog.csv:81`; `packages/domain/src/candidate-intelligence.ts:42-50`; `packages/domain/src/candidate-purpose-projection.ts:68-83` | Expand ARG-404/115/206/615 with reversible reviewed identity resolution that never broadens consent. |
| DC-05 | P0 | Retention/deletion is a strong requirement without entities for policy, directive, targets, attempts, receipts, holds, and restore reconciliation. | `plans/security-privacy.md:94-125`; `plans/data-model.md:10,52`; `plans/risks.md:20,41`; `plans/tickets/backlog.csv:24,59,64,135` | Add the executable object model to ARG-022/207/212/806 rather than a new subsystem. |
| DC-06 | P1 | Criteria, search, shortlists, recommendations, and introductions need immutable decision snapshots and invalidation state. | `plans/data-model.md:45-50`; `plans/match-science.md:61-67`; `plans/security-privacy.md:104`; `plans/tickets/backlog.csv:93-100`; `packages/domain/src/candidate-workflow-outcomes.ts:36-42` | Define decision snapshots across ARG-502-509 with policy, criteria, universe, exclusions, source/consent/availability times, author, and revalidation. |
| DC-07 | P1 | Safety, support, feedback, staff observation, and communication need purpose-separated objects and visibility rules. | `plans/data-model.md:44,49-50`; `plans/experience.md:94-97`; `plans/security-privacy.md:161-166`; `plans/tickets/backlog.csv:87,89,101-103` | Strengthen ARG-410/412/510-512; isolate safety evidence from ordinary feedback/support. |
| DC-08 | P1 | Localization metadata lacks translation provenance, jurisdiction, fallback rules, parity checks, and fail-closed legal/safety behavior. | `plans/content-model.md:23,25,34,43`; `plans/data-model.md:66` | Fold into ARG-023/311 instead of creating a localization platform. |
| DC-09 | P2 | The previous content-review status overstates completeness. | `plans/reviews.md:12,34` | Preserve the old review historically and record this new cycle with disposition/evidence. |

Domain/content strengths to preserve: independent lifecycle concepts, person and
account separation, candidate-approved source-grounded fields, rights and
revision provenance, strong withdrawal semantics, human-led matching,
aggregate-only partners, and truthful synthetic/non-production boundaries.

## Wave 3 — Product and experience

### Product strategy and MVP wedge

Overall assessment: the human-led concierge thesis, local proving ground,
client-funded model, free candidate consideration, non-guarantees, and
anti-automation boundaries are disciplined. The portfolio has nevertheless
advanced synthetic intelligence depth ahead of buyer, operator, capacity, and
pilot-economics evidence.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| PS-01 | P0 | Active synthetic implementation has outpaced the approved service-evidence-before-technology sequence, and planning CI does not reject active tickets with unfinished dependencies. | `plans/delivery.md:5-19,62-77`; `plans/decisions.md:15-18`; `plans/research/research-synthesis-tracker.md:9-19`; `plans/tickets/backlog.csv:116-120`; `plans/tickets/ARG-617-admin-candidate-analytics.md:29-43,118-128,170-200`; `scripts/validate-plans.mjs:103-138`; `scripts/report-next-work.mjs:18-63` | Add an explicit synthetic-prototype exception model and CI enforcement; reconcile historical active states. |
| PS-02 | P0 | Research tests positioning comprehension but not target-buyer problem intensity, recent behavior, alternatives, budget authority, or credible commitment. | `plans/product-strategy-decision.md:33-63`; `plans/research/ARG-003-concept-language-testing.md:3-8,81-90,105-123`; `plans/research/session-materials/ARG-003-moderator-guide.md:94-100`; `plans/research/session-materials/ARG-003-concept-stimuli.md:92-112` | Propose one buyer-problem/commitment research ticket before ARG-010/011/009; do not overload ARG-003. |
| PS-03 | P0 | Commercial viability, matchmaker capacity, and serviceable candidate liquidity are not one measurable decision contract. | `plans/product-strategy-decision.md:136-166,195-206`; `plans/metrics.md:26-41`; `plans/tickets/backlog.csv:12-13`; `plans/product.md:37-41`; `plans/risks.md:30-33` | Strengthen ARG-010/011 and dependencies; separate workflow feasibility, concierge viability, and incremental AI/mobile benefit. |
| PS-04 | P1 | The candidate-side value exchange and response/service standard are not a coherent tested proposition. | `plans/product-strategy-decision.md:65-88`; `plans/product.md:49-51`; `plans/research/session-materials/ARG-003-moderator-guide.md:86-92`; `plans/experience.md:7-29` | Add a candidate-proposition stimulus to ARG-003 and define the candidate promise under ARG-013/016. |
| PS-05 | P1 | “P0 capabilities” blur milestone scope by listing AI/mobile despite their later service-validation gate. | `plans/mvp-scope.md:9-19,55-70`; `plans/tickets/backlog.csv:116-120` | Replace the flat list with a milestone matrix covering required software, manual fallback, prototype-only, deferred, entry, and exit evidence. |
| PS-06 | P2 | Differentiation research focuses on competitor claims rather than customer alternatives and switching triggers. | `plans/product-strategy-decision.md:170-193` | Add dated alternatives/positioning evidence to buyer discovery; avoid a speculative feature-comparison program. |
| PS-07 | P2 | Open assumptions lack IDs, confidence, evidence, owners, expiry, and disconfirming thresholds. | `plans/mvp-scope.md:106-116`; `plans/traceability.md:7-22` | Add an assumption register linked to tests and decisions. |

Product strengths to preserve: human-led authority, the local pilot as proving
ground rather than exclusionary ICP, free candidate consideration, honest
non-guarantees, manual fallbacks, denominator discipline, participant evidence
requirements, and explicit prototype boundaries.

### Staff product design, accessibility, and UX

Overall assessment: the world-class risk is coherence, not visual polish. The
plan lacks several end-to-end service and cross-channel contracts, and it
mistakes a completed token foundation for the broader reusable component/state
system promised by the design plan.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| UX-01 | P0 | The revenue-bearing paying-client journey is absent from the detailed experience plan. | `plans/product.md:17-35,43-51`; `plans/experience.md:15-17,51-118`; `plans/research/ARG-002-founder-matchmaker-workflow.md:72-84,124-132`; `plans/research/ARG-003-concept-language-testing.md:81-90`; `plans/tickets/backlog.md:22-27,102-120` | Expand ARG-012 with separate client/member blueprints and client-side failure/recovery cases; reference from ARG-411/501. |
| UX-02 | P0 | ARG-118 delivered tokens/adapters, not the reusable accessible component and interaction-state foundation implied by the canonical design plan. | `plans/design-system.md:119-134`; `plans/tickets/ARG-118-design-system-foundation.md:15-43`; `packages/design-system/README.md:1-19`; `plans/tickets/backlog.md:89,97,145-156` | Add one new cross-platform component/state-pattern foundation ticket; preserve ARG-118's historical scope. |
| UX-03 | P1 | Safety, privacy-rights, and support are split features rather than one understandable case journey. | `plans/experience.md:64-68,87-97`; `plans/security-privacy.md:78-108,161-172`; `plans/tickets/backlog.md:69-77,100,118-120,150`; `plans/product.md:132-147` | Add shared case-state/actor/communication acceptance under ARG-012/013 and downstream tickets. |
| UX-04 | P1 | Cross-channel continuity between web, email, mobile, and human fallback is implicit. | `plans/mvp-scope.md:106-115`; `plans/experience.md:87-99`; `plans/tickets/backlog.md:92-105,143-151` | Add a cross-channel contract to ARG-012/019 and reference it from account/notification/mobile tickets. |
| UX-05 | P1 | Accessibility is well stated but concentrated in final ARG-801 verification rather than shifted into research, components, and feature tickets. | `plans/design-system.md:136-158,182-196`; `plans/research/ARG-003-concept-language-testing.md:81-90`; `plans/research/participant-screener.md:49-58`; `plans/tickets/backlog.md:154-164`; `apps/mobile/lib/main.dart:50-74,111-179,199-255` | Expand ARG-003, the component ticket, ticket templates, and ARG-801 with representative AT/device evidence. |
| UX-06 | P1 | Operational IA lacks routable navigation, durable task ownership, saved state, permission-state, and cross-record continuity planning. | `plans/experience.md:137-142`; `apps/admin/src/app/admin-home.tsx:301-373,992-1006,1025-1053,1172-1198`; `plans/tickets/backlog.md:64-77,97,119,140` | Expand ARG-203/012 and reference from ARG-406/503/511/617. |
| UX-07 | P1 | AI governance lacks a shared human-review interaction contract across AI surfaces. | `plans/ai-governance.md:36-71,117-153`; `plans/design-system.md:151-159`; `plans/tickets/backlog.md:124-135`; `apps/web/src/app/prototype.tsx:394-443` | Expand ARG-020/610 and the component/state ticket with a common evidence/review pattern. |
| UX-08 | P2 | Partner/admin tasks need concept testing, but pilot permissions should remain bounded. | `plans/experience.md:101-118,137-142` | Add task-based testing to existing tickets; do not add person-level partner access. |
| UX-09 | P2 | The discovery map can imply comparative scoring despite its disclaimers. | `apps/admin/src/app/admin-home.tsx:892-930`; `apps/admin/src/app/styles.css:909-929` | Keep as research stimulus; require a non-spatial equivalent if retained and no production ticket absent evidence. |

UX strengths to preserve: independent lifecycle semantics, purpose-specific
consent, assistive and reversible AI, honest unknown/stale/suppressed analytics,
visible dashboard lineage, provenance-oriented fact inspection, local-only
prototype labels, focus/reflow/reduced-motion foundations, and evidence-aware
research gates.

Do not create visual-polish tickets for unapproved art direction, decorative
motion, anthropomorphic AI, expanded partner access, voice, billing, or native
scope merely to appear premium.

### Service design and matchmaker research

Overall assessment: intended operations are distributed across journey lists,
principles, and backlog titles rather than one executable frontstage/backstage
service model. Existing Phase 0 tickets should be hardened before product
implementation expands.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| SD-01 | P0 | ARG-012 has no executable service blueprint connecting frontstage, backstage, systems, queues, targets, evidence, communication, exceptions, manual fallback, and reconciliation. | `plans/experience.md:72-85,120-133`; `plans/tickets/backlog.csv:14`; `plans/mvp-scope.md:5-11`; `apps/admin/src/app/admin-home.tsx:1097-1165` | Create `plans/service-blueprint.md` as ARG-012's acceptance artifact and test five exception scenarios. |
| SD-02 | P0 | Human service capacity and response promises are not quantitatively connected to campaign/client/candidate demand. | `plans/product.md:27-35,132-147`; `plans/metrics.md:26-42`; `plans/operations.md:82-93`; `plans/risks.md:30-31` | Add a conservative human-capacity model to ARG-011/operations/metrics. |
| SD-03 | P0 | Research authorization and consent operations are incomplete and internally inconsistent for ARG-617. | `plans/research/session-materials/ARG-617-moderator-guide.md:19-42`; `plans/research/consent-and-session-script.md:3-11`; `plans/research/research-synthesis-tracker.md:18-19`; `plans/research/research-operations-runbook.md:81-116` | Correct consent scope and approve recruitment channels, ownership, incentives, receipt storage, retention/deletion, and participant system of record before contact. |
| SD-04 | P0 | Safety and support are software capabilities without a staffed human-service policy, coverage model, response targets, or tabletop. | `plans/experience.md:51-68`; `plans/mvp-scope.md:94-104`; `plans/operations.md:15-47`; `plans/tickets/backlog.csv:66,101-103` | Add service-assurance policy to ARG-012/025 or one shared gate; keep safety judgment human. |
| SD-05 | P1 | Lifecycle states lack their required actor/transition, external-copy, timing, appeal, notification, audit, and retention matrices. | `plans/experience.md:23-29,51-68` | Expand ARG-005/013 acceptance. |
| SD-06 | P1 | Adjacent operators and hypothetical clients can be mistaken for practicing-matchmaker or buyer evidence. | `plans/research/ARG-002-founder-matchmaker-workflow.md:33-43`; `plans/research/participant-screener.md:20-26,49-66` | Preserve proxy evidence but label it; require practicing-matchmaker evidence for domain gates. |
| SD-07 | P1 | ARG-002/003 lack explicit pass/revise/stop thresholds comparable to ARG-617. | `plans/research/ARG-003-concept-language-testing.md:81-94,144-154`; `plans/research/ARG-002-founder-matchmaker-workflow.md:112-120`; `plans/research/session-materials/ARG-617-moderator-guide.md:180-200` | Predefine critical misconceptions, neutral clarification, counterevidence, resampling, and escalation rules. |
| SD-08 | P1 | Current prototypes cannot validate end-to-end service coordination, assignment, persistence, handoffs, or exceptions. | `apps/admin/src/app/admin-home.tsx:1107-1165`; `apps/web/src/app/prototype.tsx:242-255`; `plans/research/synthetic-dry-runs/ARG-617-dashboard-reconciliation-walkthrough.md:21-30` | Use low-cost service enactment under ARG-012; do not add speculative workflow controls. |
| SD-09 | P2 | ARG-618 lacks a complete controlled-beta service-research protocol. | `plans/tickets/ARG-618-candidate-interview-beta.md:14-25`; `plans/research/research-operations-runbook.md:21-23` | Require recruitment, compensation, accessibility, safety, data lifecycle, staffing, fallback, communication, and decision rubric before Ready. |

Service-design strengths to preserve: human decision authority, independent
lifecycles, mutual approval, aggregate-only partners, evidence-type separation,
observable ARG-617 tasks, and honest disconnected prototypes.

Do not automate admission, contextual preference translation, subjective-note
decisions, shortlist rationale, introduction consent, crisis response, disputes,
feedback interpretation, recruitment consent, service promises, or residual-risk
acceptance.

## Wave 4 — Commercialization, documentation, and delivery control

### Commercial operations and monetization

Overall assessment: the concierge-not-marketplace boundary, candidate-free
model, non-guarantees, independent lifecycles, hosted-card intent, and immutable
attribution are sound. Commercial readiness is blocked by missing offer,
economics, payment-stage, accounting, client-journey, and operating contracts.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| COM-01 | P0 | ARG-010 and ARG-017 remain placeholder rows rather than decision-ready commercial packages. | `plans/tickets/backlog.csv:12,19`; `plans/decisions.md`; `plans/product.md:37-41` | Create detailed files for ARG-010/017 and an ADR-017 decision packet; do not authorize billing from backlog titles. |
| COM-02 | P0 | The transition from a manual/provider-hosted pilot payment to integrated admin billing is not staged. | `plans/product.md:37-41`; `plans/architecture.md`; `plans/tickets/backlog.csv:19` | Define a manual/vendor-hosted pilot stage and a later integrated-billing stage; do not introduce Stripe Connect. |
| COM-03 | P0 | The paying-client commercial journey lacks explicit states, side effects, evidence, failure recovery, and cancellation semantics. | `plans/product.md:17-35,43-51`; `plans/experience.md:15-17`; `plans/tickets/backlog.csv:14` | Add the client journey to ARG-012 and reference it from ARG-010/017 and later admin work. |
| COM-04 | P0 | Tax, accounting, reconciliation, and commercial-policy ownership are not assigned. | `plans/risks.md:30-33,51-57`; `plans/tickets/backlog.csv:27` | Assign accountable owners under ARG-025 and require qualified CPA/counsel review before accepting the commercial model. |
| COM-05 | P0 | Commercial KPIs do not yet test contribution margin, sales cycle, collection, refund/dispute exposure, or service capacity. | `plans/metrics.md:26-41`; `plans/product-strategy-decision.md:136-166` | Strengthen ARG-010/011/021 around one pilot-economics decision contract. |
| COM-06 | P0 | Billing, cancellation, refund, dispute, reconciliation, and customer-support operations have no executable runbook. | `plans/operations.md:15-47`; `plans/tickets/backlog.csv:19` | Make a commercial runbook an ARG-017 acceptance artifact before taking payment. |
| COM-07 | P1 | Recruiter referral planning in Asana is more detailed than the canonical repository and risks becoming a parallel plan. | Asana epic `1217799563417774` and children; `plans/tickets/backlog.csv` | Map the Asana work into canonical commercial/referral decisions; distinguish compensated, noncompensated, candidate, and client referrals. |
| COM-08 | P1 | Attribution, credit, obligation, and settlement are not separated as distinct concepts. | `plans/data-model.md`; `plans/product.md:37-41` | Define immutable attribution independently from compensation eligibility, obligation, approval, and settlement. |
| COM-09 | P1 | No canonical admin implementation ticket owns pricing, payment state, receipts, reconciliation, or restricted financial access. | `plans/tickets/backlog.csv:19,97-103` | Add these later as separately gated implementation outcomes after ARG-010/017 approval, not as part of the current planning audit. |
| COM-10 | P1 | Referral implementation depends on a decision about compensated versus noncompensated referrals. | `plans/decisions.md`; Asana referral decision task `1217799553903329` | Make the decision an explicit gate before any ledger or code ticket. |
| COM-11 | P2 | Subscription mechanics and marketplace/vendor orchestration are premature. | `plans/product.md:37-41`; `plans/mvp-scope.md` | Defer until repeatable demand and operational evidence exist. |

Commercial strengths to preserve: concierge service rather than a marketplace,
candidate participation without fees, no outcome guarantees, independent member
and commercial lifecycles, provider-hosted payment surfaces, and durable
attribution without implied compensation.

### Documentation and DevRel readiness

Overall assessment: the repository has unusually strong planning, ADR,
governance, evidence, and generated-contract foundations. The priority is making
those materials authoritative and enforceable; a public developer portal would
be premature.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| DOC-01 | P0 | Repository and Asana workflow states disagree, while no automated control enforces the one-ticket WIP rule or resolves authority. | `plans/documentation-governance.md:7`; `plans/tickets/backlog.csv`; live Asana section `1216473233375598`; `scripts/validate-plans.mjs` | Expand ARG-024 or create one delivery-control ticket covering authority, reconciliation, WIP, and runbook drift. |
| DOC-02 | P1 | Required canonical metadata and review dates are policy but are not validated, and the validation snapshot is stale. | `plans/documentation-governance.md:3-26`; `scripts/validate-plans.mjs` | Expand ARG-024/117 with metadata, review-date, and stale-evidence checks. |
| DOC-03 | P1 | Generated SDK documentation still contains publication instructions and placeholders that can be mistaken for released integration support. | `plans/tickets/backlog.csv:21,34`; generated SDK README files | Harden ARG-019/102 with release-state labels, examples, compatibility evidence, and publication gates. |
| DOC-04 | P1 | Incident, provider, and operator templates lack named lifecycle ownership and rehearsal evidence. | `plans/operations.md:15-47`; `plans/documentation-governance.md` | Add owners, review cadence, and rehearsal evidence to existing operational tickets. |
| DOC-05 | P1 | Release evidence is collected but does not yet form a controlled, signed release manifest. | `plans/delivery.md:122-136`; `plans/checklists/master.md` | Expand ARG-117/811 rather than add a parallel release-docs system. |
| DOC-06 | P2 | Application-level onboarding and contextual help are shallow. | `plans/experience.md`; `apps/admin/src/app/admin-home.tsx` | Add task-specific onboarding acceptance to the relevant later feature tickets. |
| DOC-07 | P2 | Screenshot and visual-evidence provenance is not governed. | `plans/reviews.md`; `plans/documentation-governance.md` | Add lightweight provenance rules if screenshots become release or research evidence. |
| DOC-08 | P2 | Claim/evidence terminology is strong but not universal across product, research, AI, analytics, and release documents. | `plans/ai-governance.md`; `plans/metrics.md`; `plans/research/` | Normalize one evidence taxonomy through ARG-024/117. |

Documentation strengths to preserve: canonical-plan intent, ADRs and decision
registers, evidence-linked tickets, generated contracts, explicit synthetic
boundaries, and honest release gates. Do not add a public DevRel portal yet.

### Agile delivery, traceability, and ticket quality

Overall assessment: the package has a strong Definition of Ready/Done,
transition authority, risk policy, research discipline, acyclic dependency
graph, and PR-based delivery. Its delivery-control layer is nevertheless
ambiguous: live Asana is compliant, but repository status, ownership, planner
logic, and ticket granularity do not represent authorized work reliably.

| ID | Severity | Finding | Key evidence | Existing coverage / proposed disposition |
| --- | --- | --- | --- | --- |
| TPM-01 | P0 | Eight repository rows are `In progress` despite live Asana having only the audit active, and several have unfinished dependencies and unassigned owners. | `plans/delivery.md:62-77,112-149`; `plans/tickets/backlog.csv:6,116-120`; live Asana section `1216473233375598` | Choose Asana as workflow authority, separate delivery status from artifact maturity, reconcile the eight rows, and codify the WIP rule. |
| TPM-02 | P0 | The next-work planner can label Proposed, Blocked, In progress, or In review work implementation-safe because it does not enforce Ready, ownership, review, or WIP. | `scripts/report-next-work.mjs:23-63`; `scripts/report-next-work.test.mjs:75` | Harden the planner and add negative tests for every forbidden state. |
| TPM-03 | P0 | Named ownership and critical-risk assignment are required but ARG-025 is sequenced too late; 125 of 140 rows have unassigned owner and reviewer. | `plans/delivery.md:149`; `plans/risks.md:51-57`; `plans/tickets/backlog.csv:27` | Re-sequence ARG-025 as immediate governance work and assign interim accountable people. |
| TPM-04 | P0 | ARG-617 is an epic-sized outcome with at least 27 merged PR increments and several distinct remaining gates. | `plans/delivery.md:51,102`; `plans/tickets/ARG-617-admin-candidate-analytics.md:19-45`; merged PRs `#61-#86` | Keep ARG-617 as an outcome parent and split remaining access/integration, telemetry, representative research, and release-verification children. |
| TPM-05 | P0 | `main` is not protected despite extensive PR/CI activity. | `README.md:99`; `plans/tickets/backlog.csv:31`; live GitHub branch-protection check | Narrow and re-sequence ARG-100; enable required checks, independent review, conversation resolution, and direct-push restrictions. |
| TPM-06 | P1 | Structural plan validation misses readiness, ownership, estimate enums, active ticket files, waivers, blocked metadata, WIP, traceability, and Asana reconciliation. | `scripts/validate-plans.mjs:103-186`; `plans/tickets/backlog.csv:6,32-35` | Expand ARG-024 and its validator acceptance instead of creating many governance tickets. |
| TPM-07 | P1 | Decision, ADR, milestone, checklist, and evidence states contain reconciliation debt and are not computed into one readiness view. | `plans/decisions.md:28`; `plans/checklists/master.md`; `plans/traceability.md` | Move ARG-024 forward and add a machine-readable milestone/evidence manifest. |
| TPM-08 | P2 | Canonical metadata, research/decision ticket templates, branch naming, weekly review evidence, and synthetic-versus-real labels need consistency fixes. | `plans/documentation-governance.md:3`; `plans/README.md:64`; `plans/research/research-synthesis-tracker.md:9-21` | Reconcile directly under ARG-024/117; do not create separate tickets. |

Delivery strengths to preserve: explicit readiness/completion definitions,
human transition authority, strict privacy and research gates, synthetic-versus-
real evidence boundaries, acyclic dependencies, focused CI, and the live
single-WIP Asana discipline.
