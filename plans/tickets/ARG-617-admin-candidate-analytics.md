# ARG-617 — Matchmaker candidate analytics foundation

- **Epic:** Candidate intelligence
- **Capability/requirement IDs:** CAP-003, CAP-007, CAP-009, CAP-010
- **Priority:** P1
- **Status:** In progress
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned matchmaking, product, data, privacy, and design reviewers
- **Target milestone:** Private beta
- **Estimate band:** L
- **Dependencies:** ARG-115, ARG-121, ARG-503, ARG-615
- **Decision/risk links:** DEC-008, DEC-012, DEC-020, R-016, R-028, R-033, R-043

## Outcome

Jenny and authorized staff can understand candidate supply, data quality, intake operations, and discovery coverage using approved fields and honest denominators.

## Acceptance criteria

- [ ] Define metric contracts for candidate supply, completeness/freshness, consent/availability, funnel by mode, correction burden, search coverage, shortlist throughput, and introduction outcomes. Candidate supply, approved-field coverage, and field-state counts now have a synthetic aggregate contract; funnel and operational metrics remain open.
- [ ] Every dashboard value links to authoritative source lineage, cohort, time window, freshness, and missing-data state. The first aggregate contract includes source projection lineage, opaque cohort, bounded time window, and explicit small-cohort suppression; per-metric freshness and missing-data semantics remain open.
- [ ] Staff can filter and inspect approved facts with provenance and uncertainty; raw interview content is not exposed by default.
- [ ] Permissions and aggregate thresholds prevent inappropriate small-cohort or partner disclosure.
- [ ] No overall candidate-value, attractiveness, personality, wealth, compatibility, or relationship-success score is shown.
- [ ] Product analytics, operational records, legal audit evidence, and security telemetry remain separate.
- [ ] Representative matchmaker workflow testing shows the views reduce manual reconciliation without encouraging workarounds.

## Current development increment

- Branch: `codex/ARG-617-candidate-metrics`
- `candidate-analytics-snapshot/v1` consumes only the validated
  `candidate-purpose-projection/v1` analytics boundary and emits aggregate
  candidate supply, approved-field coverage, excluded-assertion, and field-state
  counts.
- Every snapshot carries an opaque cohort key, bounded time window, projection
  time, and approved-only/raw-source-free lineage.
- Cohorts smaller than the explicit minimum are fully suppressed: no count,
  ratio, candidate identifier, assertion identifier, or approved source value is
  emitted. The minimum cannot be configured below five.
- This is pure synthetic domain code. It does not add persistence, analytics
  transport, an admin dashboard, real candidate data, or production access.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
