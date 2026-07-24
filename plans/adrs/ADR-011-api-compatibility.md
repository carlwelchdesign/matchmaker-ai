# ADR-011 — API evolution and installed-mobile compatibility

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** API and mobile engineering
- **Reviewers:** Project owner
- **Decision deadline:** Before contract generation

## Context

Web deployments can move with the API, but installed iOS and Android clients
may remain in use for months. An otherwise routine server change can therefore
break active clients.

## Decision

- Published API versions are additive-first.
- Removing or renaming fields, changing field meaning, narrowing accepted
  values, or adding a new required request field is breaking.
- Clients must tolerate unknown response fields.
- Enum expansion requires an explicit client fallback before publication.
- Breaking product endpoints require a new major route version and a documented
  support/deprecation window approved under `ARG-019`.
- Unversioned system endpoints such as liveness may exist when they do not
  expose product data or mobile behavior.
- Contract regeneration, consumer compilation, and behavioral tests are merge
  gates.
- The server must not infer minimum supported app versions until the product
  owner approves the mobile support policy.

## Security, privacy, operational, and cost implications

Compatibility reduces forced upgrades and emergency releases. Old clients must
not bypass current server-side authorization or consent policy; those controls
remain authoritative on every supported version.

## Consequences

The initial liveness contract establishes the mechanism without prematurely
choosing a product-API retirement period. `ARG-019` still owns the commercial
support window and forced-update policy.

## Reversal or migration strategy

A breaking change ships on a new major route, with telemetry, migration,
client-release, communication, and rollback plans approved before retirement.

## Evidence and approvals

- Generated TypeScript and Dart client checks under `ARG-102`.
- Implementation ticket: [ARG-102](../tickets/ARG-102-api-contracts.md)
