# Deduplicated Gap Matrix

## Interpretation

This matrix consolidates independent findings into planning decisions. It does
not authorize implementation or modify the canonical backlog. Severity reflects
the earliest gate that would be unsafe or uneconomic to cross without resolving
the gap.

| Theme | Severity | Consolidated gap | Primary findings | Existing coverage | Recommended disposition |
| --- | --- | --- | --- | --- | --- |
| Workflow authority and lifecycle integrity | P0 now | Asana enforces one active ticket, while the repository reports eight other tickets in progress and does not separate delivery status from artifact maturity. | PS-01, DOC-01, TPM-01, TPM-06, TPM-07 | ARG-024, ARG-117 | Add one bounded delivery-control outcome for the immediate authority/readiness problem; retain ARG-024 for broader traceability. Make Asana authoritative for workflow and the repository authoritative for durable evidence. |
| Readiness, ownership, and merge governance | P0 now | Planning tools can recommend unauthorized work; most backlog ownership is unassigned; critical risks lack accountable people; `main` is not protected. | SQ-01, TP-03, AI-08, TPM-02, TPM-03, TPM-05 | ARG-025, ARG-100, ARG-024 | Re-sequence and harden the existing tickets; no new governance epic. |
| Buyer evidence and commercial viability | P0 before offer approval | The plan has concept-comprehension evidence but not buyer problem intensity, budget authority, commitment, capacity, unit economics, or a staged payment model. | PS-02, PS-03, SD-02, COM-01-06 | ARG-010, ARG-011, ARG-017, ARG-021 | Add one buyer research ticket; turn existing commercial rows into decision-ready packages. |
| Executable service and client experience | P0 before pilot | The paying-client journey, service blueprint, human capacity, safety/support coverage, handoffs, exception paths, and cross-channel recovery are not one executable operating model. | UX-01, UX-03, UX-04, UX-06, SD-01, SD-04, COM-03 | ARG-005, ARG-012, ARG-013, ARG-019, ARG-025 | Expand existing tickets around one versioned service blueprint and state/transition model. |
| Research authorization and evidence quality | P0 before outreach | Research protocols do not yet form an approved data, consent, recruitment, incentive, withdrawal, retention, safety, and decision-threshold operating package. | TP-01, SD-03, SD-06, SD-07, SD-09 | ARG-002, ARG-003, ARG-012, ARG-617/618 | Add one shared research-operations authorization gate; preserve proxy/synthetic evidence labels. |
| Client/server and deployable-target boundaries | P0 before further prototype promotion | Browser Client Components import a server-designated domain package, and the admin image is omitted from container scanning/SBOM parity. | SA-01, SA-02 | ARG-101, ARG-104 | Reopen/narrowly remediate the existing ARG-101 and ARG-104 evidence; do not create a parallel architecture ticket. |
| Domain ownership, lifecycle, and release composition | P0 before persistence | Aggregate ownership, transition rules, independent participant decisions, typed field identity, release bundles, reversible identity resolution, and executable deletion objects are incomplete. | SA-03, DC-01-05, DA-05, DA-09, TP-02, TP-04-05 | ARG-005, ARG-013, ARG-022/023, ARG-204/206/207/212, ARG-311/404/501/615 | Expand existing domain tickets and ADR-018; no CMS or parallel privacy platform. |
| Measurement and privacy-safe analytics | P0 before analytics transport | KPI contracts, analytics ADR authority, fact/event architecture, deletion/reconciliation dependencies, differencing defenses, computation lineage, and data-quality rules are not executable. | DA-01-10, TP-06, COM-05 | ARG-021, ARG-114/115, ARG-307/310, ARG-617 | Expand and rewire existing analytics tickets; do not add a warehouse or stream platform. |
| ARG-617 ticket granularity | P0 now | One ticket has accumulated at least 27 PR increments and spans synthetic contracts, UI, telemetry, access, representative research, and release gates. | TPM-04, DA-01, PS-01 | ARG-617 and ARG-021/114/115/201-203/615/801-811 | Retain ARG-617 as an outcome parent, link its already-owned gates, and add only a distinct representative-matchmaker research child if needed. |
| Accessible component and interaction-state system | P0 before scaling UI work | ARG-118 delivered tokens and adapters, not the reusable accessible components, states, AI-review patterns, and cross-platform interaction contracts promised by the design plan. | UX-02, UX-05, UX-07 | ARG-118, ARG-801 | Add one focused component/state-pattern foundation ticket; preserve ARG-118 as completed historical evidence. |
| Provider-AI release system | P0 before provider activation | Overlapping ADR authority, reproducible evaluation, injection/exfiltration controls, claim/evidence schemas, model lifecycle, subgroup methods, and reviewer operations remain unimplemented gates. | AI-01-07 | ARG-020, ARG-607-612 | Reconcile ADR-009/016 and expand existing tickets; no new AI epic or provider authorization. |
| Reliability, assurance, and release evidence | P1 before private beta | Failure/degradation behavior, audit durability, detection, support matrices, resilience capacity, supply-chain evidence, incident ownership, and a computed release manifest are incomplete. | SA-05-06, SQ-03-07, DOC-04-05, TPM-07 | ARG-105, ARG-108-117, ARG-205/211, ARG-801-811 | Strengthen existing acceptance artifacts and separate web pilot assurance from conditional mobile/AI gates. |
| Commercial referral semantics | P1 before referral code | Asana contains stronger referral planning than the canonical repo, while attribution, credit, obligation, eligibility, and settlement are conflated. | COM-07-10 | ARG-010, ARG-017 and Asana referral epic | Reconcile into canonical decisions after choosing compensated versus noncompensated referral scope; do not create marketplace mechanics. |
| Documentation coherence and record debt | P1 continuous | ADR status, canonical metadata, SDK release state, branch convention, screenshot provenance, research labels, and weekly-review evidence drift. | SA-07, DC-09, DOC-02-03, DOC-06-08, TPM-08 | ARG-024, ARG-117, ARG-019/102 | Correct records through existing governance tickets and direct owner-approved reconciliation. |

## Explicitly deferred or rejected scope

- No marketplace, Stripe Connect, subscription system, or multi-vendor payment
  orchestration before repeatable demand and a reviewed commercial model.
- No data warehouse, stream processor, search service, scoring system, or
  parallel deletion/analytics platform without measured need.
- No new AI epic, provider activation, voice, autonomous ranking, admission,
  matching, or introduction.
- No generic CMS, public DevRel portal, person-level partner access, native-app
  expansion, or visual-polish program as a substitute for product evidence.
- No participant contact, real candidate data, persistence, identity resolution,
  or production access from this audit.

## Strengths that require no directional change

- Human-led and reversible consequential decisions.
- Candidate-free, concierge-not-marketplace commercial positioning.
- Independent lifecycles and mutual introduction consent.
- Purpose-specific consent, provenance, withdrawal, and evidence separation.
- Synthetic-versus-real boundaries and explicit external approval gates.
- Modular-monolith, transactional delivery, generated-contract, and
  deny-default security direction.
- Honest unknown, stale, suppressed, and insufficient-evidence analytics states.
