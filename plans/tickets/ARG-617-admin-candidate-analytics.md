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

- [ ] Define metric contracts for candidate supply, completeness/freshness, consent/availability, funnel by mode, correction burden, search coverage, shortlist throughput, and introduction outcomes. Candidate supply, approved-field coverage, field-state counts, assertion access/freshness, interview funnel by mode, correction burden, search coverage, shortlist throughput, and introduction outcomes now have synthetic aggregate contracts; candidate availability remains open.
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
- `candidate-interview-funnel/v1` composes the existing content-free interview
  outcome and usage ledgers into start, completion, approved-field, and
  correction-burden metrics overall and by mode. Sessions that switch modes are
  explicitly attributed to `mixed`; sessions without mode evidence remain
  `unobserved` instead of being guessed. A corrections-per-completion value of
  10,000 basis points means one correction per completed interview.
- Funnel lineage rejects duplicate sessions or executions, orphaned usage, and
  records outside the declared time window. Its aggregate payload contains no
  session/execution identifier, provider/model detail, or interview content and
  uses the same full small-cohort suppression boundary.
- Candidate assertion access now returns a stable fail-closed reason for
  lifecycle, freshness, retention, purpose grant, allowed role, and
  purpose/role mismatch instead of only a boolean. Existing callers retain the
  same boolean behavior through that decision contract.
- `candidate-assertion-eligibility/v1` aggregates those reasons for the
  analytics-only purpose and role. It carries the declared evaluation time and
  candidate-intelligence lineage, suppresses all metrics for small cohorts, and
  emits no candidate/assertion/consent identifiers or approved source values.
- Candidate availability remains explicitly unimplemented because no approved
  lifecycle contract exists yet; the fictional admin display is not treated as
  operational evidence.
- `candidate-search-observation/v1` records only opaque search, criteria, policy,
  projection, time, data-quality, and count lineage. It rejects query content,
  candidate identifiers, impossible eligible/retrieved/reviewed counts, and a
  source projection newer than the search.
- `candidate-search-coverage/v1` reports complete-search count, zero-result rate,
  eligible-to-retrieved coverage, and retrieved-to-reviewed rate against the
  approved discovery projection. Candidate counts summed across searches are
  labeled opportunities rather than unique people. Partial, delayed, stale,
  backfilled, and quarantined observations are counted separately and excluded
  from metric denominators rather than silently treated as complete.
- Search reports preserve criteria/policy version sets, reject duplicate search
  IDs or mismatched projection lineage, and suppress all metric and data-quality
  counts for cohorts smaller than five. This defines measurement only; ARG-503
  and ARG-605 search/retrieval implementation remain gated.
- `candidate-workflow-observation/v1` records a content-free, cumulative journey
  through review, shortlist, recommendation, two independent participant
  decisions, delivery, first meeting, follow-up interest, and respectful
  closure. Stage precedence, mutual approval before delivery, selection lineage,
  and explicit missing-feedback states are enforced at runtime.
- `candidate-workflow-funnel/v1` keeps review-to-shortlist,
  shortlist-to-recommendation, recommendation-to-mutual-approval,
  approval-to-delivery, delivery-to-first-meeting, and meeting-to-reciprocal-
  interest denominators separate. It never emits a compatibility or generalized
  success score, and safety telemetry remains outside product analytics.
- Only complete workflow observations enter conversion rates; other
  data-quality states stay separate. Small cohorts suppress all outcome and
  data-quality counts unless both the source candidate cohort and recorded
  journey cohort meet the minimum, while opaque policy/selection-set and
  approved discovery projection lineage remain available.
- This is pure synthetic domain code. It does not add persistence, analytics
  transport, an admin dashboard, real candidate data, or production access.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
