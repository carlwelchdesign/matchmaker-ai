# ADR-012 — Transactional event delivery and durable job identity

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** Platform and data
- **Reviewers:** Project owner
- **Decision deadline:** Before worker foundation

## Context

Argent will perform consequential asynchronous work such as privacy actions,
provider reconciliation, notifications, media processing, and AI assistance.
A database commit must not report success while its required event disappears,
and repeated callbacks or retries must not create duplicate side effects.

The platform does not yet have approved domain entities, a production queue, or
provider contracts. The foundation therefore needs portable delivery semantics
without choosing those later integrations prematurely.

## Decision drivers

- Atomic recording beside the source database mutation.
- At-least-once delivery with explicit idempotency and bounded leases.
- Safe concurrent workers without a singleton dispatcher.
- Verified, deduplicated, replayable provider receipts.
- No raw webhook bodies, signatures, credentials, or unrestricted errors.
- Durable job identity before queue execution is introduced.
- Operator-visible quarantine and reconciliation states.

## Options considered

### PostgreSQL outbox, inbox, and job registry

Keep durable intent and identity beside the data whose mutation creates it.
Workers claim rows with short leases and `FOR UPDATE SKIP LOCKED`; provider
events and jobs use stable idempotency keys plus canonical payload hashes.

### Publish directly to a queue after committing

Commit application data first and publish in a second operation. This creates a
failure window where the mutation succeeds but the message is lost.

### Distributed transaction across PostgreSQL and a broker

Coordinate both systems through a two-phase protocol. This adds operational
coupling and is poorly supported by common managed queues.

## Security, privacy, operational, and cost implications

The operational tables live in `argent_system` and contain schema-versioned,
purpose-minimized JSON only. Callers must normalize provider payloads before
storage. Raw request bodies, signature material, credentials, stack traces, and
free-form error messages are excluded. Machine-readable error codes are
bounded. PostgreSQL adds no new service cost for the foundation, but table age,
lease age, retries, and quarantine require future metrics, retention, and
operator controls.

## Decision

- Record domain events in `argent_system.outbox_events` using the same
  PostgreSQL transaction as the source mutation.
- Deliver at least once. Consumers remain idempotent; publication state is not
  proof that a downstream side effect occurred exactly once.
- Claim work in ordered, bounded batches using `FOR UPDATE SKIP LOCKED`.
- Use expiring leases. Only the current, unexpired lease owner may mark an
  outbox event published.
- Preserve an aggregate-scoped `ordering_key`; do not promise global order.
- Accept webhook receipts only after provider-specific signature verification.
- Deduplicate on `(provider, external_event_id)` and reject reuse with a
  different event type, schema version, or canonical payload hash.
- Store normalized replay-safe webhook payloads, never raw bodies or
  signatures.
- Register jobs on `(job_type, idempotency_key)` with canonical payload hashes.
- Keep queue execution, retry schedules, cancellation behavior, dead-letter
  recovery, and broker selection in `ARG-110`/ADR-005.
- Keep provider verification and payload normalization in each integration's
  owning ticket.

## Consequences

Database-backed dispatchers can scale horizontally without duplicate claims,
but delivery remains at least once and downstream idempotency is mandatory.
Expired leases are recoverable. Hash collisions caused by accidental
idempotency-key reuse fail closed. Operational payload schemas must be reviewed
like API contracts and versioned before use.

## Reversal or migration strategy

Migration `002_event_delivery_foundation` can be reversed while no dependent
domain migrations or live workflows exist. A future broker may consume the
same outbox rows; moving durable job execution out of PostgreSQL requires a
reconciled cutover, not a destructive table replacement.

## Evidence and approvals

- Implementation ticket:
  [ARG-112](../tickets/ARG-112-event-delivery-foundation.md)
- Operator procedure:
  [event-delivery runbook](../runbooks/event-delivery.md)
- PostgreSQL locking and idempotent insertion:
  [locking clause](https://www.postgresql.org/docs/18/sql-select.html) and
  [`INSERT ... ON CONFLICT`](https://www.postgresql.org/docs/18/sql-insert.html)
