# Metrics, Attribution, and Analytics Plan

## Purpose

Metrics must be defined before instrumentation. Product analytics, security telemetry, legal audit evidence, operational records, and raw provider payloads use separate schemas, access policies, retention, and deletion behavior.

## Metric contract

Every beta KPI requires:

- stable ID and plain-language name;
- business question and decision it informs;
- entity grain;
- numerator and denominator;
- unit and aggregation;
- time window and timezone;
- eligibility/cohort rules;
- allowed dimensions;
- null/unknown handling;
- authoritative source and event lineage;
- late-arriving correction/backfill policy;
- privacy classification and prohibited dimensions;
- owner and review cadence;
- synthetic worked example.

## Candidate beta metrics requiring definitions

| Metric | Initial grain | Key ambiguity to resolve |
| --- | --- | --- |
| Qualified applications | Application | Exact qualification rule and rule version |
| Application completion | Started application | Restart/duplicate handling |
| Time to decision | Submitted application | Paused/needs-information time |
| Eligible candidates per client | Client engagement snapshot | Hard constraints and availability freshness |
| Time to viable shortlist | Engagement | Meaning and human approval of “viable” |
| Mutual introduction acceptance | Proposed introduction | Expired/no-response handling |
| Completed date rate | Approved introduction | Verification source and cancellation |
| Repeat-date rate | Completed first date | Reporting window and missing feedback |
| Satisfaction | Survey response | Instrument and response bias |
| AI override rate | Reviewed AI artifact | Edit versus reject versus policy failure |
| Campaign conversion | Attribution cohort | First-touch versus campaign membership |
| Operational review time | Application review work session | Idle time and reopened reviews |

## Conversational-intake metrics

Compare structured, conversational, and hybrid modes without treating greater disclosure as inherently better:

- completion, abandonment, save/resume, and mode-switch rate;
- time and correction burden;
- transcript word-error rate by approved language, accent cohort, device, and environment;
- proposed-field support, applicant edit/reject, and extraction-error rates;
- sensitive oversharing and third-party disclosure incidents;
- accessibility failure and human-assistance requests;
- matchmaker usefulness of approved fields;
- audio/transcript deletion completion, latency, compute cost, and device impact.
- guide-topic coverage, single-question-turn rate, unsupported-probe rate, clarification and human-handoff rate;
- model/provider/token/audio-minute/retry and estimated cost per start, completion, and approved field;
- feature-flag cohort, fallback success, mid-session disable recovery, and spend-cap activation.

## Matchmaker candidate-intelligence metrics

- candidate supply by approved, purpose-limited criteria and freshness state;
- approved-profile completeness, stale/unknown/declined values, and availability refresh;
- search coverage, zero-result searches, shortlist throughput, and human review time;
- introduction-stage denominators from considered through mutual approval and reported outcome;
- no candidate-value, desirability, personality, wealth, compatibility, or predicted-success score.

## Matching outcome taxonomy

Use distinct denominators for retrieval review, shortlist inclusion, matchmaker recommendation, each participant's consent, delivered introduction, first meeting, interest in another meeting, respectful closure, safety concern, and self-reported relationship status at defined intervals.

Do not create one “successful match” label. Record the selection policy, candidate set, missing feedback, and exposure opportunity so outcomes are not mistaken for unbiased training labels.

## Attribution model

Preserve an immutable touchpoint chain:

1. invite/referral issuer and code;
2. landing source/session and campaign;
3. application start and submit source;
4. campaign membership and eligibility decision;
5. later campaign reuse or partner interaction;
6. versioned attribution rule used for reporting or compensation.

First-touch evidence is not overwritten by later activity. Compensation and partner reporting must cite the attribution rule version.

## Analytics event requirements

- Globally unique event ID and schema version.
- Subject/object safe identifiers.
- Occurred-at and received-at timestamps.
- Source application/version and environment.
- Consent and campaign context where relevant.
- Deduplication and backfill behavior.
- Automated payload allowlist that blocks sensitive profile text, media, notes, screening, safety, exact location, and message content.
- Withdrawal/deletion propagation to derived facts where required.
- Event-to-metric lineage and data-quality state.

## Data-quality operations

Analytics reports distinguish:

- complete;
- partial;
- delayed;
- stale;
- backfilled;
- suppressed for privacy;
- invalid/quarantined.

Dashboards must not silently convert missing data to zero.
