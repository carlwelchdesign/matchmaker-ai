# ARG-615 — Candidate intelligence data contract and database foundation

- **Epic:** Candidate intelligence
- **Capability/requirement IDs:** CAP-004, CAP-005, CAP-009, CAP-010
- **Priority:** P1
- **Status:** Proposed
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned data, product, privacy, security, and matchmaking reviewers
- **Target milestone:** Private beta
- **Estimate band:** L
- **Dependencies:** ARG-005, ARG-021, ARG-107, ARG-114, ARG-206, ARG-207, ARG-501, ARG-611
- **Decision/risk links:** DEC-007, DEC-008, DEC-012, DEC-013, DEC-020, R-001, R-028, R-034, R-039, R-043

## Outcome

Argent can build a deduplicated, permission-aware candidate database from approved assertions while keeping raw interview sources, staff notes, safety records, and analytics separated by purpose.

## Acceptance criteria

- [ ] Interview guide, planned question, response source, transcript revision, approved assertion, and AI execution/cost lineage are modeled and versioned.
- [ ] Only applicant-approved assertions are eligible for matchmaker discovery and analytics dimensions.
- [ ] Raw audio, unapproved transcript, rejected proposals, safety data, and private notes cannot enter search or product analytics.
- [ ] Unknown, declined, stale, superseded, disputed, and withdrawn values remain distinct.
- [ ] Candidate identity is deduplicated without broadening campaign or partner consent.
- [ ] Field purpose, classification, allowed roles, retention, deletion, freshness, and provenance are enforced and testable.
- [ ] Synthetic migrations and fixtures cover correction, withdrawal, deletion propagation, duplicate resolution, and historical versioning.
- [ ] No universal candidate-value, desirability, personality, wealth, or compatibility score exists.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
