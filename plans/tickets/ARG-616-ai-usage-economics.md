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
- [x] Define budgets and alerts by environment, mode, cohort, candidate, day, and provider.
- [x] Enforce maximum turn/time/token/audio limits and deterministic structured-form fallback.
- [x] Exercise provider and feature kill switches without data loss.
- [x] Report cost per start, completion, approved field, correction, and human-review minute saved.
- [x] Measure storage, evaluation, support, and payment overhead beyond API unit prices.
- [x] Keep first-pilot candidate application free unless DEC-016 is explicitly superseded after legal/fairness/refund review.
- [x] Use account verification, invitations, and rate limits before considering a fee as abuse control.

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
- Scoped budget rules now cover environment, interaction mode, opaque cohort
  key, opaque candidate key, UTC day, and provider. Each rule defines execution
  and estimated-cost ceilings plus a warning threshold in basis points.
- Evaluation aggregates only matching content-free usage, emits explicit
  warning or exceeded alerts, and selects the structured fallback if any
  applicable rule is exceeded. Runtime factories reject extra content,
  identifiable candidate/cohort labels, and duplicate rule or execution IDs.
- The session policy now distinguishes candidate turns from provider
  executions and enforces cumulative input-token, output-token, and audio
  ceilings alongside elapsed-time and per-execution limits. The deterministic
  planner checks the policy before every follow-up or reopened question.
- The local Conversation/Hybrid experience keeps its normal four-question
  path, but a crossed guardrail returns the unchanged prior question history
  and routes the candidate into the existing Structured Sunrise guide with a
  clear local-preview notice. No provider call or content-bearing telemetry is
  introduced.
- Feature and provider kill-switch tests now prove that prior content-free
  usage history is not mutated. The candidate-facing fallback clones the
  current in-memory answer snapshot and validates it against the fixed guide
  before restoring completed responses, explicit declines, and source revision
  numbers in the Structured Sunrise worksheet.
- Kill-switch transfer remains local React state only. It is distinct from the
  content-free usage ledger, makes no provider or network call, and is cleared
  when the page is refreshed or the candidate begins again.
- `interview-outcome-measurement/v1` records one content-free session outcome:
  start/completion timestamps, approved-field and correction counts, and an
  explicitly estimated human-review-time saving. Incomplete sessions cannot
  claim approved fields or review time saved.
- `interview-unit-economics-report/v1` joins validated outcomes to validated
  usage by opaque session ID and reports total estimated micro-USD cost plus
  estimated cost per start, completion, approved field, correction, and saved
  human-review minute. Missing denominators return `null`; a real zero-cost
  start remains zero.
- Report lineage rejects duplicate sessions or executions, unlinked usage, and
  usage outside the measured session window. The contract stores no response,
  prompt, transcript, profile field value, or other candidate content.
- `interview-operating-cost/v1` records storage, evaluation, support, and
  payment overhead as either actual or estimated micro-USD costs. Actual costs
  require both an approval reference and receipt or invoice evidence.
- One-time purchases, recurring subscriptions, usage charges, and internal
  labor are distinguished by kind and billing cadence. Subscription reporting
  derives the current active or trial register from the latest recorded state,
  so cancellation evidence removes a service from the active list without
  deleting its history.
- Vendor, service, subscription, approval, evidence, and payment-source values
  are opaque operational aliases. The schema rejects extra fields and always
  reports `paymentCredentialsStored: false`; card numbers, images, CVV values,
  billing credentials, and candidate content do not belong in this ledger.
- `interview-fully-loaded-economics/v1` combines API usage estimates with
  operating overhead and recomputes cost per start, completion, approved field,
  correction, and human-review minute saved.
- No vendor account, purchase, subscription, or charge was created as part of
  this implementation. The initial operational register is empty until a
  specific service and exact purchase receive review and approval.
- `interview-fee-decision/v1` keeps the candidate submission fee at zero by
  default. Any nonzero fee is rejected unless account verification, invitation
  controls, and rate limits are verified first and the decision carries an
  explicit DEC-016 supersession plus founder, legal, fairness, pricing, and
  refund-policy approval references.
- The fee-decision contract contains policy state and opaque approval references
  only. It rejects extra fields and stores no payment credentials. It does not
  implement checkout, charge a candidate, or claim that the dependent abuse
  controls are already operational.
