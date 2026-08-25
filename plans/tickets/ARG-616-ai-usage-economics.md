# ARG-616 — Interview AI usage economics and budget controls

- **Epic:** Governed AI assistance
- **Capability/requirement IDs:** CAP-005, CAP-007, CAP-010
- **Priority:** P1
- **Status:** In progress
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned founder, product, finance, platform, and privacy reviewers
- **Target milestone:** Private beta
- **Estimate band:** M
- **Dependencies:** ARG-010, ARG-017, ARG-108, ARG-601, ARG-609
- **Decision/risk links:** DEC-016, DEC-020, R-018, R-021, R-041, R-043

## Outcome

The team knows the real cost per completed interview and can cap or stop spend without charging candidates merely for consideration.

## Acceptance criteria

- [x] Per session and execution, record provider/model, input/output tokens, audio minutes, latency, retries, cache behavior, and estimated cost without source content.
- [ ] Define budgets and alerts by environment, mode, cohort, candidate, day, and provider.
- [ ] Enforce maximum turn/time/token/audio limits and deterministic structured-form fallback.
- [ ] Exercise provider and feature kill switches without data loss.
- [ ] Report cost per start, completion, approved field, correction, and human-review minute saved.
- [ ] Measure storage, evaluation, support, and payment overhead beyond API unit prices.
- [ ] Keep first-pilot candidate application free unless DEC-016 is explicitly superseded after legal/fairness/refund review.
- [ ] Use account verification, invitations, and rate limits before considering a fee as abuse control.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).

## Foundation evidence

- Branch: `codex/ARG-616-interview-cost-controls`
- `interview-usage-ledger/v1` records environment, session/execution IDs,
  interview mode, provider/model, token and audio usage, latency, retries, cache
  behavior, and estimated micro-USD cost with `sourceContentStored: false`.
- Runtime validation accepts only the exact content-free execution shape. Tests
  reject candidate source text, inconsistent cache claims, and deterministic
  executions that falsely claim provider usage or cost.
- A pure budget evaluator returns either `allow` or `structured-fallback` for
  feature/provider kill switches and execution, session-time, token, latency,
  audio, and session-cost limits without mutating recorded history.
- The current planner is representable as a zero-token, zero-cost
  deterministic-template execution. Provider selection, pricing configuration,
  persistence, telemetry transport, payment, and production enforcement remain
  unimplemented and approval-gated.
- Every proposed question in the running local Conversation/Hybrid flow now
  snapshots one validated deterministic usage entry beside its lifecycle
  record. The entry contains proposal time, local session, interaction mode,
  and a unique question-attempt execution ID, but no prompt, answer, source
  reference, proposed field, or other interview content.
- Editing an earlier response preserves prior zero-cost usage history and adds a
  new execution for the new question attempt. A tested projection rejects
  duplicate execution IDs instead of silently double-counting replans.
