# ARG-112 — Transactional event-delivery foundation

- **Epic:** Event delivery
- **Capability/requirement IDs:** CAP-007
- **Priority:** P0
- **Status:** In Progress
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** M
- **Dependencies:** ARG-107; ARG-101
- **Decision/risk links:** ADR-012; ADR-022; R-027
- **Blocked reason/review date:** Not blocked

## JSON-boundary remediation — 2026-07-23

A second post-completion boundary review demonstrated that compile-time
`JsonObject` types were not sufficient at untyped runtime boundaries. A `Date`
value was silently canonicalized as an empty object, while a sparse array
produced invalid JSON text. ARG-112 is reopened narrowly until canonical
serialization rejects non-JSON objects, sparse or augmented arrays, accessor
properties, cycles, excessive nesting, and non-JSON primitive values with
bounded validation errors.

## Outcome

Ensure committed operational intent is not silently lost and repeated provider
events or job requests cannot create different work under the same identity.

## Scope

- Transactional, schema-versioned domain outbox records.
- Concurrent bounded claiming with expiring ownership leases.
- Verified, normalized, deduplicated webhook receipts.
- Idempotent durable job identity and lifecycle registry.
- Canonical JSON hashing and collision detection.
- Reversible PostgreSQL migration, integration tests, and operator runbook.

## Non-goals

- Provider-specific signature algorithms or payload mappings.
- Broker, queue worker, scheduler, retry policy, dead-letter UI, or autoscaling.
- Domain events for unapproved application or matchmaking entities.
- Exactly-once delivery or global event ordering.
- Raw webhook request bodies, signatures, secrets, or free-form error storage.
- Production monitoring, retention automation, or operator authorization.

## Acceptance criteria

- [x] A domain mutation and its outbox record can commit or roll back together.
- [x] Concurrent workers claim disjoint bounded batches.
- [x] Lease ownership is required to publish or release an event.
- [x] Failed events can be retried or quarantined without storing error text.
- [x] Unverified webhook input is rejected before persistence.
- [x] Repeated webhook IDs and job keys are idempotent only for identical
  schema-versioned content.
- [x] Job identity, class, priority, availability, and lifecycle state are
  durable without implementing the future queue.
- [x] Migration reversal and reapplication preserve the foundation.
- [x] Root verification and disposable database integration smoke pass in CI.
- [x] Intended changes are committed and reviewed in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: Internal operational metadata and caller-minimized payloads;
  future payload classifications inherit from their source domain.
- Data-flow changes: Source transactions produce outbox rows; verified provider
  messages produce receipts; job producers register durable intent.
- Roles/permissions: Local database owner only; least-privilege production
  roles remain in ARG-106/ARG-113.
- Consent/retention: No person data is introduced; payload-specific retention
  must be approved before a real event type is registered.
- Deletion/revocation effects: Future deletion workflows must use non-sensitive
  references and reconciliation, not copied profile payloads.
- Threats/abuse: Lost publish, duplicate delivery, forged webhook, replay,
  idempotency collision, lease theft, poison message, and sensitive logs.
- AI level and review: No AI execution; `ai` is only a reserved queue class.
- Accessibility: No user-interface change.
- Logging/redaction: No payload or error-message logging; persisted failures use
  bounded machine-readable codes.

## Implementation checklist

- [x] Confirm dependencies and decisions.
- [x] Confirm API/data/permission design.
- [x] Implement the smallest coherent change.
- [x] Add positive, negative, collision, rollback, and concurrency tests.
- [x] Add operator-safe state without sensitive payload logging.
- [x] Update contracts, docs, decisions, risks, and runbooks.
- [x] Define migration reversal and recovery behavior.

## Verification evidence

- [x] Focused tests: 20 database unit tests and 12 real-PostgreSQL integration
  tests pass.
- [x] Static/quality checks: `pnpm verify`, repository formatting, TypeScript,
  Flutter analysis/tests, builds, generated-contract drift, full dependency
  audit, and `git diff --check` pass.
- [x] Security/privacy checks: Forged receipts, idempotency collisions,
  non-machine-readable errors, wrong lease owners, and non-object payloads fail
  closed.
- [x] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: Disposable PostgreSQL smoke passes locally.
- [x] Rollout/rollback evidence: Two migrations reverse and reapply from zero;
  expired/failed work remains recoverable by lease and state.

## Delivery evidence

- Branch: `ticket/ARG-112-event-delivery-foundation`
- Commit: `f13cacfc44279ac859c7cacb151dcb7f08f87d9e`
- PR: [#15](https://github.com/carlwelchdesign/matchmaker-ai/pull/15)
- Merge: `7118d071f9015c235228019a77048efaca9356bb`
- Deployment: Local/CI event-delivery foundation only
- Evidence URLs/paths:
  [Quality and database smoke](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30071451656),
  [Security](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30071451661),
  [Secret scan](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30071451655)
- Completion date: 2026-07-23

## Completion notes

Exactly-once claims are prohibited. Publication and downstream effects require
separate idempotency and reconciliation evidence.

The first cold CI run exposed a readiness race against PostgreSQL's temporary
initialization server. The smoke probe now waits for the final TCP listener and
prints container diagnostics only on timeout.

Post-merge review reopened ARG-112 on 2026-07-23 with concrete failed
acceptance evidence: an expired lease owner could still release an event before
another worker reclaimed it, canonical payload sorting used host-locale
behavior, and immediate job availability used the application clock.
Remediation was completed on `ticket/ARG-112-lease-hash-remediation`.

Remediation delivery:

- Commit: `71ddaef3afb77075e4bc3101d63d8607c66e1ac5`
- PR: [#19](https://github.com/carlwelchdesign/matchmaker-ai/pull/19)
- Merge: `b0119445fbf3b2cf0cbc21405527a1b7ad166cde`
- Evidence:
  [Quality and database smoke](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30072376332),
  [Security](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30072376317),
  [Secret scan](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30072376319)

- Follow-up owner: ARG-106, ARG-108, ARG-110, ARG-113, ARG-115, and provider
  integration tickets
