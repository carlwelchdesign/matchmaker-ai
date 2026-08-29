# ARG-026 — Match-science evidence and validation

- **Epic:** Match science
- **Capability/requirement IDs:** CAP-003, CAP-005, CAP-009
- **Priority:** P0
- **Status:** Blocked
- **Artifact maturity:** Planning and evidence review
- **Named owner:** Project owner
- **Named approver/reviewer:** Project owner; qualified relationship-science or psychometrics review remains required
- **Target milestone:** Decision gate
- **Estimate band:** M
- **Dependencies:** ARG-001, ARG-003
- **Decision/risk links:** DEC-012, DEC-014, ADR-021, R-038, R-040
- **Blocked reason/review date:** ARG-003 and qualified review remain incomplete;
  review 2026-09-04; fallback is to retain the evidence review as planning
  evidence without authorizing predictive claims or implementation.

## Outcome

Argent has a defensible, transparent boundary for collecting match-relevant information and assisting candidate discovery without claiming to predict attraction or relationship success.

## Scope

- Evidence review and primary-source bibliography.
- Construct register and prohibited-use policy.
- Matching pipeline boundary and outcome taxonomy.
- Prospective pilot, fairness, missing-data, and selection-bias plan.
- Implementation gate for criteria, retrieval, and recommendation tickets.

## Non-goals

- Building a vector index or matching model.
- Selecting a model/provider.
- Approving MBTI, a compatibility score, or automated introduction.
- Retrospectively declaring service outcomes to be training labels.

## Acceptance criteria

- [x] Initial evidence review and product consequences documented in [match-science.md](../match-science.md).
- [x] Predictive compatibility, MBTI pairing, inferred personality, and demographic stereotyping are prohibited.
- [x] Construct-register schema, outcome taxonomy, proposed matching boundary, and gate checklist are documented.
- [ ] Qualified relationship-science or psychometrics review is recorded.
- [ ] Each proposed construct has evidence, instrument/license, privacy, burden, permitted-use, and prohibited-use entries.
- [ ] Prospective pilot protocol and evaluation thresholds are approved before implementation.

## Security, privacy, AI, data, and accessibility

- Data classes: SENSITIVE profile facts and approved narratives; HIGHLY_RESTRICTED data excluded.
- Data-flow changes: None in this research ticket.
- Roles/permissions: Matchmaker reviews evidence; no autonomous decision maker.
- Consent/retention: Only purpose-approved, user-approved fields are eligible for retrieval.
- Deletion/revocation effects: Matching indexes and dependent artifacts must invalidate withdrawn sources.
- Threats/abuse: Pseudoscientific claims, proxy discrimination, missing-data penalties, and label leakage.
- AI level and review: Recommendation at most; final shortlist and introduction decisions remain human.
- Accessibility: Instrument burden and accommodation are construct-register fields.
- Logging/redaction: Evaluation evidence excludes raw sensitive narrative.

## Research checklist

- [x] Review current pre-meeting attraction, personality-similarity, and MBTI evidence.
- [x] Define the initial permitted, gated, and prohibited construct classes.
- [x] Define a non-predictive candidate-discovery pipeline.
- [x] Define selection-aware outcome stages.
- [ ] Assign scientific reviewer and grade the full evidence set.
- [ ] Complete the construct register.
- [ ] Draft and approve the prospective pilot protocol.
- [ ] Review claims, fairness, privacy, and licensing.

## Verification evidence

- [x] Planning review: `plans/match-science.md`
- [ ] Scientific review:
- [ ] Privacy/legal review:
- [ ] Prospective protocol:

## Delivery evidence

- Branch: `planning/foundation`
- Commit:
- PR: <https://github.com/carlwelchdesign/matchmaker-ai/pull/1>
- Merge: Pending
- Deployment: Not applicable
- Evidence paths: `plans/match-science.md`
- Completion date: Pending

## Completion notes

The initial evidence supports an assistive retrieval and explanation system, not a compatibility predictor. Implementation remains blocked.

- Follow-up owner: ARG-025 assignment required
