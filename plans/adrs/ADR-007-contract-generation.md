# ADR-007 — OpenAPI contract generation for TypeScript and Dart

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** API and mobile engineering
- **Reviewers:** Project owner
- **Decision deadline:** Before the first API client

## Context

The web, API, and Flutter applications need one transport definition without
sharing server-only domain code or maintaining handwritten client models.

## Decision

- Fastify route schemas are the authoritative HTTP contract.
- The API emits a checked-in OpenAPI document.
- OpenAPI Generator produces a TypeScript Fetch client and Dart Dio client.
- Generated artifacts are checked in so mobile builds do not require Java or
  the generator.
- Generated code is never edited manually. A narrow, documented postprocessor
  may correct deterministic generator defects.
- CI regenerates both clients and rejects drift.
- Consumer tests compile and exercise generated operations and models.

## Security, privacy, operational, and cost implications

Only client-safe request and response schemas cross this boundary. Server
domain logic, authorization rules, provider configuration, secrets, and
persistence models remain outside it. Pinning the generator makes builds
reproducible but requires deliberate upgrade review.

## Consequences

Contract changes must begin in API route schemas and include regenerated
clients. This adds generated files to review, while removing handwritten
cross-platform model drift.

## Reversal or migration strategy

Replace the generator only through an ADR amendment and a reviewed full-client
diff. The checked-in OpenAPI document remains the migration boundary.

## Evidence and approvals

- `openapitools.json`
- `packages/contracts/scripts/`
- Implementation ticket: [ARG-102](../tickets/ARG-102-api-contracts.md)
