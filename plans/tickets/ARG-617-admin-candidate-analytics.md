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

- [x] Define metric contracts for candidate supply, completeness/freshness, consent/availability, funnel by mode, correction burden, search coverage, shortlist throughput, and introduction outcomes.
- [x] Every dashboard value links to authoritative source lineage, cohort, time window, freshness, and missing-data state. The display-ready metric-set contract preserves per-source schema and observation time, distinguishes fresh, stale, and unknown values, and separates missing denominators, unavailable sources, and small-cohort suppression.
- [ ] Staff can filter and inspect approved facts with provenance and uncertainty; raw interview content is not exposed by default. The governed domain contract and a synthetic local inspection workflow are implemented and browser-verified, but authenticated staff access, real integration, and representative staff testing remain open.
- [x] Permissions and aggregate thresholds prevent inappropriate small-cohort or partner disclosure. The access-decision boundary returns dashboard values only to authorized internal staff for explicitly allowed cohorts, returns no dashboard for partner audiences or roles, and preserves null-valued small-cohort suppression.
- [x] No overall candidate-value, attractiveness, personality, wealth, compatibility, or relationship-success score is shown. Dashboard keys are an explicit operational allowlist, and the serialization regression test excludes generalized or sensitive-trait scores.
- [ ] Product analytics, operational records, legal audit evidence, and security telemetry remain separate.
- [ ] Representative matchmaker workflow testing shows the views reduce manual reconciliation without encouraging workarounds.

## Remaining completion gates

- Authenticated staff access and sessions require the `ARG-201` identity
  boundary; the local inspection concept does not grant a role or access real
  candidate data.
- Persistence and real candidate integration remain gated by `ARG-615` and its
  declared dependencies.
- Analytics transport and telemetry separation remain gated by the approved
  architecture and privacy-safe pipeline in `ARG-021` and `ARG-114`; this
  ticket does not invent those event or retention boundaries.
- Representative matchmaker workflow testing requires human participation and
  evidence that the views reduce reconciliation without encouraging
  workarounds.
- Keep `ARG-617` in progress until these gates are satisfied and reviewed.

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
- `candidate-availability-observation/v1` records only an explicit,
  candidate-confirmed availability decision with effective and freshness
  timestamps. The strict contract has no interview-content, inferred-state,
  admission, ranking, or discovery-eligibility field; availability alone cannot
  broaden consent or make a candidate discoverable.
- `candidate-availability-snapshot/v1` selects the latest unambiguous
  confirmation per candidate and reports available, paused, not-available,
  withdrawn, stale, and unknown counts. Rates use the full declared cohort as
  their denominator, and all metrics are suppressed below five candidates.
- Availability snapshots expose no candidate or observation identifiers and
  explicitly preserve `discoveryEligibilityGranted: false` and
  `admissionDecisionGranted: false` lineage. This is synthetic measurement only;
  persistence, identity resolution, production authorization, and an admin view
  remain gated.
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
- `candidate-dashboard-metric-set/v1` composes the six aggregate analytics
  sources into display-ready metrics while preserving source schema, opaque
  cohort, reporting window, source-as-of time, freshness, and missing-data
  state for every value. Missing sources remain unknown instead of becoming
  zero, and suppressed cohorts remain suppressed through the display boundary.
- Dashboard composition rejects mismatched source scope or schema, inconsistent
  source state, future lineage, invalid counts, and ratio values outside the
  0-to-10,000 basis-point range. It exposes no candidate identifier, interview
  content, generalized score, or raw source value.
- Dashboard-lineage branch: `codex/ARG-617-metric-lineage`
- Dashboard-lineage commit: `699f5a5`
- Dashboard-lineage PR: https://github.com/carlwelchdesign/matchmaker-ai/pull/62
- Dashboard-lineage verification: 108 domain tests across 14 files; domain
  typecheck and build; all workspace tests, TypeScript tasks, and production
  builds; the 140-ticket planning validator; repository formatting; and diff
  hygiene.
- `candidate-dashboard-access-decision/v1` is a fail-closed application policy
  boundary for synthetic dashboard data. It authorizes only internal
  `data-analyst` and `matchmaker` roles for explicitly allowed opaque cohorts;
  partner audiences, partner roles, and unlisted cohorts receive a decision
  containing no dashboard.
- The access boundary revalidates schema, content-exclusion flags, time and
  cohort scope, lineage timestamps, missing-data state, freshness presence,
  numeric bounds, and unique metric keys. Small-cohort values remain null, and
  the decision explicitly records that neither partner nor small-cohort values
  were exposed.
- Dashboard-access branch: `codex/ARG-617-dashboard-access`
- Dashboard-access commit: `4b7c8e1`
- Dashboard-access PR: https://github.com/carlwelchdesign/matchmaker-ai/pull/63
- Dashboard-access verification: 112 domain tests across 15 files; domain
  typecheck and build; all workspace tests, TypeScript tasks, and production
  builds; the 140-ticket planning validator; repository formatting; and diff
  hygiene.
- `candidate-approved-fact-inspection/v1` turns a purpose- and role-matched
  candidate projection into filterable approved facts for candidate, topic,
  and freshness state. Each result carries exact review provenance, consent and
  retention bounds, and a current or expires-soon label derived from an
  explicit warning window.
- Inspection must use a projection generated at the exact access time, rejects
  expired or malformed assertions, preserves global unknown/disputed/private
  state counts, and distinguishes approved, excluded, source-evaluated, and
  filter-matching counts. Output selects approved values only and contains no
  raw transcript, prompt, audio, model, or generalized score fields.
- Fact-inspection branch: `codex/ARG-617-fact-inspection`
- Fact-inspection commit: `ee76d68`
- Fact-inspection PR: https://github.com/carlwelchdesign/matchmaker-ai/pull/64
- Fact-inspection verification: 116 domain tests across 16 files; domain
  typecheck and build; all workspace tests, TypeScript tasks, and production
  builds; the 140-ticket planning validator; repository formatting; and diff
  hygiene.
- The local admin concept now consumes the governed inspection contract through
  a clearly synthetic access-time projection. Matchmakers can combine
  candidate, topic, and freshness filters; inspect exact source, guide, review,
  consent, freshness, and retention lineage; and see explicit empty results
  without an inferred answer.
- The interface keeps unknown, disputed, and private field counts visible,
  distinguishes facts excluded at access time, labels facts that expire soon,
  and contains no raw interview, compatibility score, prediction, or automatic
  recommendation. It does not authenticate staff, connect to real candidate
  data, persist state, or grant production access.
- Admin-fact-inspection branch: `codex/ARG-617-admin-fact-inspection`
- Admin-fact-inspection commit: `4887cf7`
- Admin-fact-inspection PR: https://github.com/carlwelchdesign/matchmaker-ai/pull/65
- Admin-fact-inspection verification: four admin tests; all workspace tests,
  TypeScript tasks, and production builds; the 140-ticket planning validator;
  repository formatting and diff hygiene; browser interaction for default,
  combined-filter, and empty-result states; and desktop plus 390-pixel mobile
  visual review with no browser warnings or errors.
- Candidate-availability branch: `codex/ARG-617-candidate-availability`
- Candidate-availability commit: `caa4de0`
- Candidate-availability PR: https://github.com/carlwelchdesign/matchmaker-ai/pull/61
- Candidate-availability verification: 102 domain tests across 13 files; all
  workspace test and TypeScript tasks; domain and full production builds; the
  140-ticket planning validator; formatting; and diff hygiene.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
