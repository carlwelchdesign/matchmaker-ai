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
