# Research Synthesis Tracker

This tracker records research execution status. It starts empty by design; do
not fill findings without actual session evidence or clearly labeled synthetic
review.

## Session coverage

| Ticket | Required session | Target count | Completed | Status | Notes |
| --- | --- | ---: | ---: | --- | --- |
| ARG-002 | Founder/operator workflow interview | 1 | 0 | Pending | Required before ARG-002 Done |
| ARG-002 | Matchmaker/high-touch operator interview | 2 | 0 | Pending | Required before ARG-002 Done unless fallback approved |
| ARG-002 | Case walkthrough | 5 | 0 | Pending | Real or explicitly synthetic cases allowed if labeled |
| ARG-003 | Applicant/candidate concept review | 3 | 0 | Pending | Required before ARG-003 Done |
| ARG-003 | Potential paying-client concept review | 2 | 0 | Pending | Required before ARG-003 Done |
| ARG-003 | Founder/operator copy review | 1 | 0 | Pending | Required before ARG-003 Done |
| ARG-003 | Accessibility-oriented concept review | 1 | 0 | Pending | Required before ARG-003 Done |
| ARG-617 | Founder/operator analytics workflow | 1 | 0 | Approved; not recruiting | Sample and threshold approved 2026-08-28; participant contact remains separately gated |
| ARG-617 | Practicing matchmaker analytics workflow | 2 | 0 | Approved; not recruiting | Sample and threshold approved 2026-08-28; participant contact remains separately gated |

## Synthetic dry-run coverage

| Ticket | Dry-run artifact | Count | Status | Limitation |
| --- | --- | ---: | --- | --- |
| ARG-002 | [Synthetic case walkthroughs](synthetic-dry-runs/ARG-002-synthetic-case-walkthroughs.md) | 5 | Complete | Not founder or matchmaker evidence |
| ARG-003 | [Synthetic concept review](synthetic-dry-runs/ARG-003-synthetic-concept-review.md) | 1 | Complete | Not applicant, client, founder, or accessibility evidence |
| ARG-617 | [Synthetic dashboard reconciliation walkthrough](synthetic-dry-runs/ARG-617-dashboard-reconciliation-walkthrough.md) | 1 | Complete | Protocol dry run only; not representative workflow evidence |

## Finding tracker

| Finding ID | Ticket | Source session | Evidence type | Finding | Classification | Confidence | Severity | Downstream tickets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ARG002-SYN-001 | ARG-002 | ARG002-CASE-SYN-001..005 | Synthetic dry run | Separate application, campaign attribution, membership, client engagement, verification, support, and introduction lifecycles. | Policy decision needed | Medium | High | ARG-005 ARG-012 ARG-013 |
| ARG002-SYN-002 | ARG-002 | ARG002-CASE-SYN-001..005 | Synthetic dry run | Matchmaker tools need provenance, freshness, uncertainty, consent recency, and human rationale before search/ranking sophistication. | Must support in MVP | Medium | High | ARG-026 ARG-501 ARG-505 |
| ARG003-SYN-001 | ARG-003 | ARG003-SYN-001 | Synthetic dry run | `100 men / 100 women` may create quota, binary-gender, or casting-call interpretation. | Needs revision | Medium | High | ARG-014 ARG-016 ARG-301 |
| ARG003-SYN-002 | ARG-003 | ARG003-SYN-001 | Synthetic dry run | `accepted`, `verified`, `private network`, and `confidential` require exact lifecycle, check, visibility, and privacy definitions. | Policy escalation | High | High | ARG-005 ARG-006 ARG-013 ARG-016 |
| ARG003-SYN-003 | ARG-003 | ARG003-SYN-001 | Synthetic dry run | Intake choice copy should emphasize equal review treatment and user approval of saved fields. | Approved direction | Medium | Medium | ARG-018 ARG-027 ARG-613 |
| ARG617-SYN-001 | ARG-617 | ARG617-SYN-001 | Synthetic dry run | The prototype and moderator tasks can expose denominator, missing-data, provenance, scoring-inference, and workaround errors without real records. | Research protocol ready for owner review | Medium | Medium | ARG-617 |

## Decision tracker

| Decision needed | Trigger | Owner | Status | Target ticket |
| --- | --- | --- | --- | --- |
| Approve lifecycle policy inputs | ARG-002 synthesis complete | Project owner | Pending | ARG-005 |
| Approve language and claim boundaries | ARG-003 synthesis complete | Project owner | Pending | ARG-016 |
| Approve first-time application concept direction | ARG-003 and ARG-012 synthesis complete | Project owner | Pending | ARG-018 |
| Approve conversational-intake continuation | ARG-003 ARG-006 ARG-018 ARG-026 complete | Project owner/privacy owner | Pending | ARG-027 |
| Decide whether `100 men / 100 women` can be public copy or must remain internal capacity language | ARG-003 participant testing | Project owner/content/legal | Pending | ARG-014 ARG-016 |
| Define exact meaning of accepted verified private network and confidential | ARG-003 synthesis and privacy/legal review | Project owner/privacy/legal | Pending | ARG-005 ARG-006 ARG-016 |
| Approve ARG-617 workflow-study sample and gate threshold | ARG-617 protocol review | Carl Welch | Approved 2026-08-28 | ARG-617 |

## Go/no-go criteria for closing ARG-002

- [ ] Required session coverage is complete or fallback is approved.
- [ ] Workflow findings are mapped to downstream tickets.
- [ ] Human/system responsibility split is clear enough for service blueprinting.
- [ ] Sensitive operational examples are redacted.
- [ ] Open assumptions are listed.

## Go/no-go criteria for closing ARG-003

- [ ] Required session coverage is complete or fallback is approved.
- [ ] Language findings are classified.
- [ ] Misleading or high-risk terms have mitigations.
- [ ] Accessibility findings are recorded.
- [ ] Open legal/privacy escalations are listed.

## Go/no-go criteria for ARG-617 workflow-test acceptance

- [x] The project/research owner approves the sample and gate threshold.
- [ ] Required representative session coverage is complete or a fallback is
  explicitly approved.
- [ ] Denominator, missing-data, provenance, and scoring interpretations are
  synthesized with counterevidence.
- [ ] Reconciliation and workaround signals are compared with each
  participant's current-process baseline.
- [ ] High-severity misunderstandings and trust/privacy workaround signals are
  resolved or explicitly accepted by the owner.
