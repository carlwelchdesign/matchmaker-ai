# Runbook — Event delivery backlog or poison message

- **Owner:** Platform owner
- **Severity:** Based on affected queue class and oldest actionable age
- **Last tested:** 2026-07-23 with synthetic PostgreSQL integration tests
- **Next test:** Before the first asynchronous domain workflow

## Detection and user impact

Alerting is not implemented yet. Until ARG-108/ARG-110, inspect counts and
oldest timestamps by status without selecting payload columns. Privacy and
safety work takes precedence over reporting or AI work.

## Immediate safety/privacy checks

- Do not print, export, or paste payload columns into logs or tickets.
- Confirm whether privacy, safety, verification, or consent work is affected.
- Stop the relevant producer if it is creating invalid or duplicate work.
- Do not replay an unverified receipt or change an idempotency key to bypass a
  collision.

## Diagnosis

Using a read-only, audited operator connection, inspect status, event/job type,
attempt count, lease age, availability, and bounded error code. Determine
whether work is pending, actively leased, expired, published, processed, or
quarantined. Correlate with the source record and downstream provider using safe
identifiers.

## Containment

- Pause the affected event or job type at its producer/consumer boundary.
- Let active leases expire before recovery unless the worker is known stopped.
- Quarantine content that repeatedly fails deterministic validation.
- Treat a provider event ID with a different hash as a security/integration
  incident, not a retry.

## Recovery

- Restore consumer health before releasing retryable outbox work.
- Reclaim only expired leases through the normal claim path.
- Replay normalized verified receipts through their idempotent consumer.
- Never edit a stored payload, hash, event ID, or job idempotency key in place.
- Use a new schema version and reviewed compensating event when content must
  change.

## Verification

- Source state and outbox intent reconcile.
- No two active workers own the same row.
- Published/processed state has downstream idempotency evidence.
- Backlog age returns below the future SLO.
- Quarantined items have an owner and disposition.

## Escalation and communication

Escalate immediately for privacy/safety delays, signature-verification
failures, hash collisions, suspected payload exposure, or unexplained missing
source intent. User-facing communication must describe impact without exposing
other applicants or internal provider details.

## Evidence and retrospective

Record safe counts, oldest age, event/job types, bounded error codes, corrective
commit/deployment, reconciliation outcome, and follow-up owner. Never attach raw
payloads or secrets.
