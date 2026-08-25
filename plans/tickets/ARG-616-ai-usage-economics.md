# ARG-616 — Interview AI usage economics and budget controls

- **Epic:** Governed AI assistance
- **Capability/requirement IDs:** CAP-005, CAP-007, CAP-010
- **Priority:** P1
- **Status:** Proposed
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned founder, product, finance, platform, and privacy reviewers
- **Target milestone:** Private beta
- **Estimate band:** M
- **Dependencies:** ARG-010, ARG-017, ARG-108, ARG-601, ARG-609
- **Decision/risk links:** DEC-016, DEC-020, R-018, R-021, R-041, R-043

## Outcome

The team knows the real cost per completed interview and can cap or stop spend without charging candidates merely for consideration.

## Acceptance criteria

- [ ] Per session and execution, record provider/model, input/output tokens, audio minutes, latency, retries, cache behavior, and estimated cost without source content.
- [ ] Define budgets and alerts by environment, mode, cohort, candidate, day, and provider.
- [ ] Enforce maximum turn/time/token/audio limits and deterministic structured-form fallback.
- [ ] Exercise provider and feature kill switches without data loss.
- [ ] Report cost per start, completion, approved field, correction, and human-review minute saved.
- [ ] Measure storage, evaluation, support, and payment overhead beyond API unit prices.
- [ ] Keep first-pilot candidate application free unless DEC-016 is explicitly superseded after legal/fairness/refund review.
- [ ] Use account verification, invitations, and rate limits before considering a fee as abuse control.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
