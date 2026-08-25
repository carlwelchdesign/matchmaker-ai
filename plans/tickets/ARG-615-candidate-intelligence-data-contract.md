# ARG-615 — Candidate intelligence data contract and database foundation

- **Epic:** Candidate intelligence
- **Capability/requirement IDs:** CAP-004, CAP-005, CAP-009, CAP-010
- **Priority:** P1
- **Status:** In progress
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned data, product, privacy, security, and matchmaking reviewers
- **Target milestone:** Private beta
- **Estimate band:** L
- **Dependencies:** ARG-005, ARG-021, ARG-107, ARG-114, ARG-206, ARG-207, ARG-501, ARG-611
- **Decision/risk links:** DEC-007, DEC-008, DEC-012, DEC-013, DEC-020, R-001, R-028, R-034, R-039, R-043

## Outcome

Argent can build a deduplicated, permission-aware candidate database from approved assertions while keeping raw interview sources, staff notes, safety records, and analytics separated by purpose.

## Acceptance criteria

- [x] Interview guide, planned question, response source, transcript revision, approved assertion, and AI execution/cost lineage are modeled and versioned.
- [x] Only applicant-approved assertions are eligible for matchmaker discovery and analytics dimensions.
- [x] Raw audio, unapproved transcript, rejected proposals, safety data, and private notes cannot enter search or product analytics.
- [x] Unknown, declined, stale, superseded, disputed, and withdrawn values remain distinct.
- [ ] Candidate identity is deduplicated without broadening campaign or partner consent.
- [x] Field purpose, classification, allowed roles, retention, deletion, freshness, and provenance are enforced and testable.
- [ ] Synthetic migrations and fixtures cover correction, withdrawal, deletion propagation, duplicate resolution, and historical versioning.
- [x] No universal candidate-value, desirability, personality, wealth, or compatibility score exists.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).

## Foundation evidence

- `candidate-interview-review/v1` is the first synthetic, persistence-free
  projection implemented under ARG-613.
- It preserves guide/question/revision provenance, source-exact derivation, and
  approved/private/rejected/declined dispositions.
- Only approved fields are eligible for later profile use or analytics.
- `candidate-intelligence-record/v1` now projects approved source-exact fields
  into assertions with candidate, consent, purpose, role, freshness, retention,
  guide, question, revision, planner/AI execution, and cost-ledger lineage.
- Non-approved fields produce source-free candidate-review states only and are
  explicitly ineligible for discovery or analytics.
- Query-time access fails closed unless the assertion is active, fresh,
  retained, purpose-granted, and requested by the role assigned to that purpose.
- Immutable lifecycle transitions distinguish disputed, stale, superseded, and
  withdrawn assertions; unknown remains a distinct source-free state.
- `candidate-purpose-projection/v1` is the only domain projection from candidate
  intelligence into matchmaker discovery or candidate analytics. It emits
  active, candidate-approved assertions only after purpose, role, consent,
  freshness, retention, classification, provenance, and lifecycle checks.
- Private, rejected, declined, unknown, stale, disputed, superseded, and
  withdrawn states contribute no source value to the projection. The output
  records aggregate state counts, `approvedAssertionsOnly: true`, and
  `rawSourceIncluded: false`; raw audio, unapproved transcripts, private notes,
  safety records, and rejected proposal content have no input path.
- Projection tests cover purpose/role mismatch, withdrawal, duplicate candidate
  identity, duplicate assertion lineage, private/rejected source exclusion, and
  prohibited-score absence. This remains a synthetic in-memory boundary rather
  than production authorization or persistence.

## Current development increment

- Branch: `codex/ARG-615-purpose-projection`
- Contract commits: `245a37b`, `c25c73c`, and current branch HEAD
- Runtime boundary: pure domain code and synthetic fixtures only
- Verification: 74 domain tests across 9 files, domain TypeScript, package
  build, planning validation, formatting, diff checks, and local prototype HTTP
  200
- Deployment: none; no database, migration, provider, real candidate data,
  submission, analytics event, or production access path

## Remaining gated work

Identity deduplication, persistence, migrations, deletion propagation, policy
configuration, and production authorization remain blocked by ARG-005,
ARG-021, ARG-114, ARG-206, ARG-207, ARG-501, and ARG-611.
