# ADR-014 — Server-only and client-safe package boundaries

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** Engineering and security
- **Reviewers:** Project owner
- **Decision deadline:** Before `ARG-101`

## Context

Shared monorepo packages can accidentally place authorization rules, private domain behavior, secrets, or provider code into web and mobile bundles.

## Decision drivers

- Make sensitive dependency direction visible.
- Keep domain policy framework-light and server-only.
- Give clients only versioned contracts and presentation primitives.
- Preserve future static checks for forbidden imports.

## Options considered

### Explicit server-only and client-safe packages

Domain policy is consumed by API/worker. Clients consume generated contracts and design-system outputs.

### One shared package

All applications import common utilities and types from one unrestricted package.

## Security, privacy, operational, and cost implications

Explicit packages reduce accidental disclosure and coupling but require import-boundary enforcement in CI. Generated clients add a build step under `ARG-102`.

## Decision

- `packages/domain` is server-only and framework-light.
- `packages/contracts` will contain client-safe schemas and generated clients.
- `packages/design-system` will contain client-safe semantic tokens and adapters.
- Web and mobile must not import server domain, provider, credential, authorization-policy, or restricted data modules.
- API and worker may consume domain and contracts.

## Consequences

The initial client-safe packages contain only boundary documentation until their owning tickets implement generation. Product code must not fill those placeholders with ad hoc types or tokens.

## Reversal or migration strategy

Move genuinely universal primitives into a narrowly named client-safe package with an import review and bundle verification. Never relax the boundary by exporting server modules.

## Evidence and approvals

- Repository structure and package documentation under `packages/`.
- Implementation ticket: [ARG-101](../tickets/ARG-101-platform-foundation.md)

