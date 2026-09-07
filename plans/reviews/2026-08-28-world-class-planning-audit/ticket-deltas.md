# Proposed Ticket Deltas

## Status

These are review proposals, not approved backlog changes. IDs prefixed `AUD-`
are temporary audit labels; final ARG IDs, owners, estimates, dependencies, and
placement require Carl Welch's approval.

## New tickets recommended

### AUD-01 — Enforce delivery-control authority and readiness

- Priority: P0.
- Outcome: Asana and repository planning state truthfully represent authorized
  work, planner output cannot authorize non-Ready work, and completed synthetic
  evidence is preserved without being confused for active implementation.
- Dependencies: approval of this audit's workflow-authority decision.
- Owner/reviewer: named delivery owner and product owner.
- Acceptance evidence:
  - Asana is documented as workflow-status authority; repository artifacts are
    documented as durable planning/evidence authority.
  - `delivery_status` is distinct from `artifact_maturity`.
  - ARG-004, ARG-026, ARG-027, and ARG-613 through ARG-617 are reconciled with
    explicit owner approval.
  - Exactly one parent ticket plus its subtasks may be active.
  - Blocked work records reason, owner, review date, and fallback.
  - The next-work report and Asana board agree.
  - Only `Ready` work with named owner/reviewer, satisfied dependencies or an
    approved waiver, concrete evidence, risk authority, and free WIP capacity
    can be recommended for implementation.

This ticket resolves the immediate authority/readiness defect. It does not
replace ARG-024's broader requirement and evidence traceability scope.

### AUD-02 — Approve research operations

- Priority: P0 before any participant contact.
- Outcome: one shared authorization gate governs human research across ARG-002,
  ARG-003, ARG-617, and later betas.
- Dependencies: founder/product-owner authorization and named research owner.
- Owner/reviewer: research owner and privacy/trust reviewer.
- Acceptance evidence:
  - approved recruitment channels and participant system of record;
  - consent receipt, incentive, withdrawal channel/SLA, accessibility, and
    participant-communication procedures;
  - research-data inventory, purpose, access, retention/deletion, redaction,
    storage, and incident handling;
  - safety escalation owner, deputy, response target, and stop conditions;
  - protocol-specific authorization is still required before outreach.

### AUD-03 — Validate target-buyer problem and commitment

- Priority: P0 before ARG-010/011/009 approval.
- Outcome: determine whether a defined paying-client segment has a sufficiently
  painful problem, budget authority, viable alternatives gap, and credible
  willingness to commit to the concierge pilot.
- Dependencies: approved research operations and participant-contact authority.
- Owner/reviewer: product/research owner and commercial reviewer.
- Acceptance evidence:
  - segment, recruitment, sample rationale, recent-behavior questions, budget
    authority, alternatives, switching triggers, and commitment ladder;
  - predeclared pass/revise/stop thresholds and disconfirming evidence;
  - practicing buyers are distinguished from adjacent/proxy participants;
  - redacted synthesis, evidence ledger, and decision recommendation.

### AUD-04 — Build the accessible component and state-pattern foundation

- Priority: P0 before additional production UI scaling.
- Outcome: extend ARG-118's tokens/adapters into reusable, accessible,
  cross-platform components and interaction-state contracts.
- Dependencies: approved core journeys and service-state model.
- Owner/reviewer: design-system engineer and accessibility/product-design reviewer.
- Acceptance evidence:
  - component and state inventory for loading, empty, error, stale, suppressed,
    permission-denied, offline/retry, success, destructive confirmation, and
    human-AI review;
  - web/admin/mobile ownership and parity rules;
  - keyboard, screen-reader, reflow, contrast, reduced-motion, touch-target, and
    representative-device evidence;
  - documented escape hatches and feature-ticket adoption requirements.

## Decompose, do not duplicate

### ARG-617 — retain as outcome parent

Preserve all merged synthetic evidence and reclassify the parent as an outcome
container or blocked parent. Do not duplicate implementation work already owned
by ARG-021/114/115, ARG-201-203, ARG-615, and launch-assurance tickets. Link those
owners as completion gates and add only a distinct representative-matchmaker
research child if the tracker requires a separately reviewable outcome.

## Existing-ticket expansions

| Tickets | Proposed adjustment |
| --- | --- |
| ARG-024, ARG-117 | Move planning governance forward; enforce readiness, ownership, metadata, estimate enums, active-ticket files, waivers, blocked metadata, WIP, traceability, milestone manifests, evidence state, and Asana reconciliation. |
| ARG-025 | Remove late commercial/strategy dependencies; immediately assign current-milestone RACI, deputies, critical-risk acceptance authorities, due dates, and review dates. |
| ARG-100 | Narrow to the live gap and enable protected `main`, required checks, independent review, resolved conversations, restricted direct push, and audited emergency bypass. |
| ARG-002, ARG-003 | Add pass/revise/stop thresholds, proxy-evidence labels, candidate value-exchange stimulus, accessibility inclusion, and approved research-data/safety operations; do not overload them with buyer validation. |
| ARG-005, ARG-013 | Add aggregate ownership and dependency rules; actor/transition, timing, notification, appeal, audit, retention, and independent introduction-decision matrices. |
| ARG-010, ARG-011, ARG-017 | Create detailed decision-ready ticket files covering offer, capacity, contribution margin, staged hosted payment, tax/accounting review, cancellation/refund/dispute/reconciliation, and commercial KPIs. |
| ARG-012 | Produce one versioned client/member service blueprint covering frontstage/backstage, queues, handoffs, targets, evidence, communications, safety/support staffing, failure recovery, manual fallback, and reconciliation. |
| ARG-019, ARG-102 | Label generated SDK release state; replace placeholders with governed examples, compatibility evidence, and publication gates. |
| ARG-020, ARG-607-612 | Reconcile ADR-009/016; implement one AI use-case registry, reproducible evaluation system, provider execution envelope, claim/evidence schema, model lifecycle, subgroup/privacy protocol, and reviewer operations. |
| ARG-021, ARG-114/115, ARG-307/310 | Approve the event/fact/aggregate/snapshot architecture; instantiate KPI contracts; add computation lineage, freshness policy, deletion/recompute, differencing controls, quality SLOs, and reconciliation. |
| ARG-022/023, ARG-204/206/207/212, ARG-311/404/501/615 | Add field-policy/schema identity, atomic release bundles, purpose-scoped permission decisions, reversible identity resolution, executable deletion objects, and consent-safe merge/split behavior. |
| ARG-104 | Add admin path triggers, image scanning, SBOM, and deployable-target parity as narrow regression acceptance. |
| ARG-101 | Clarify ADR-014 execution contexts and production API authority; remove browser imports of the server-designated package; enforce forbidden imports and browser-bundle inspection in CI. |
| ARG-105, ARG-108-116, ARG-205/211 | Add one shared dependency degradation matrix, audit durability, tested detections, incident/provider ownership, recovery reconciliation, and retained supply-chain evidence. |
| ARG-502-509 | Add immutable decision snapshots with criteria, universe, exclusions, source/consent/availability time, actor, policy version, occurrence time, invalidation, and revalidation. |
| ARG-110 | Add the domain-event catalog, ownership, evolution/compatibility, replay authorization, privacy/retention, consumer idempotency, and reconciliation contract; do not duplicate ARG-112. |
| ARG-801-811 | Separate web/admin/API pilot assurance from conditional AI/mobile gates; add versioned support matrices, resilience/capacity evidence, threat-to-test coverage, independent retest, and a signed release manifest. |

## Direct reconciliations without new tickets

- Restore ARG-102/103/104 estimate bands to their intended enum values.
- Reconcile ADR-005/010/019/020 and stale decision-register states.
- Record approved dependency waivers or correct status for ARG-101/102/118.
- Narrow R-020 to the current branch-protection and independent-review gap.
- Choose one accepted `ticket/ARG-*` or `codex/ARG-*` branch convention.
- Clarify synthetic versus real-session coverage in research trackers.
- Map the existing Asana referral epic into the canonical commercial decision
  package after choosing compensated or noncompensated referral scope.

## Proposals explicitly not recommended

- A generic marketplace, Stripe Connect, subscriptions, or vendor-orchestration
  program.
- A data warehouse, stream processor, search service, or parallel analytics,
  privacy, deletion, or quality platform.
- A new AI epic, provider activation, voice, or consequential automation.
- A generic CMS, public DevRel portal, native expansion, or visual-polish epic.
