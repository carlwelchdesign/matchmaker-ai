# ADR-001 — Modular monolith and worker boundaries

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** Engineering
- **Reviewers:** Project owner
- **Decision deadline:** Before `ARG-101`

## Context

Argent needs transactional consistency, object-level authorization, consent enforcement, auditability, background work, and independent scaling without the operational burden of premature microservices.

## Decision drivers

- Keep policy and data ownership understandable for a small team.
- Preserve atomic domain changes and explicit asynchronous delivery.
- Scale HTTP and background workloads independently.
- Avoid distributing sensitive data across unnecessary network boundaries.

## Options considered

### Modular monolith with worker process

One API deployment owns domain modules and the primary transaction boundary. A separate worker deployment consumes durable jobs and events.

### Microservices

Independent network services per domain with distributed data and operations.

### Single combined web process

Web, API, and background work share one runtime and deployment lifecycle.

## Security, privacy, operational, and cost implications

The modular monolith reduces network exposure and distributed authorization drift. API and worker credentials can still be least-privilege and worker classes can later be isolated by sensitivity. The team must prevent modules from bypassing explicit application boundaries.

## Decision

Use a modular monolith for the versioned API and framework-light domain policy. Run asynchronous work in a separate worker process. Extract services only after measured scaling, isolation, compliance, or ownership needs justify the cost.

## Consequences

- API and worker share versioned domain packages but have separate entry points and lifecycle tests.
- Cross-module workflows use explicit operations and, once persistence exists, durable events.
- No provider, framework, transport, or mobile dependency belongs in the domain package.

## Reversal or migration strategy

Move a module behind a service boundary only after its contract, data ownership, migration, failure semantics, authorization, telemetry, and incident ownership are documented.

## Evidence and approvals

- Architecture baseline: [architecture.md](../architecture.md)
- Implementation ticket: [ARG-101](../tickets/ARG-101-platform-foundation.md)

