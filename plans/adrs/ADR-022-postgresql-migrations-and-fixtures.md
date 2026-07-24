# ADR-022 — PostgreSQL migrations and synthetic fixture boundary

- **Status:** Accepted
- **Date:** 2026-07-23
- **Owner:** Engineering and data
- **Reviewers:** Project owner
- **Decision deadline:** Before `ARG-107`

## Context

Argent needs reproducible PostgreSQL changes and useful non-production data
without copying real applicant or matchmaking records into development,
testing, previews, or staging. Business schemas are not yet approved, so the
foundation must not freeze premature application entities.

## Decision drivers

- Transactional, ordered, reversible migrations with concurrency protection.
- Explicit connection configuration rather than PostgreSQL client defaults.
- Deterministic, idempotent synthetic fixtures with provenance.
- A hard production refusal and explicit staging approval.
- Minimal runtime and deployment coupling.

## Options considered

### Versioned migrations with `node-pg-migrate`

Keep migrations beside a server-only database package. Use PostgreSQL advisory
locking, transactions, and a dedicated migration ledger.

### ORM-owned schema synchronization

Define application models in an ORM and generate or push schema state from
those models.

### Hand-run SQL

Store SQL files and rely on operators to track order, concurrency, and applied
state.

## Security, privacy, operational, and cost implications

`node-pg-migrate` adds a migration dependency but preserves reviewable
PostgreSQL-native changes. The runner requires an explicit URL, never logs it,
fails immediately on concurrent execution, and keeps its ledger outside
application schemas. Fixtures contain no people, contact information, media,
conversations, or provider payloads. Production seeding is rejected even when
an override is supplied.

## Decision

- Use PostgreSQL `18` and `node-pg-migrate` for ordered migrations.
- Keep migration and fixture code in server-only `@argent/database`.
- Use `argent_app`, `argent_private`, `argent_audit`, and `argent_system`
  schemas to make purpose boundaries visible before business tables exist.
- Keep migration history in `argent_migrations.history`.
- Run migrations transactionally with advisory locking.
- Allow synthetic fixtures automatically only in local/test, require explicit
  staging approval, and always refuse production.
- Record fixture key, version, checksum, environment, and application time.
- Defer application entities, PostGIS, ORM/query-builder selection, production
  migration orchestration, and least-privilege roles to their owning tickets.

## Consequences

Every future schema change is an additive migration with an explicit reversal
or forward-recovery note. Domain modules may later select a query mapping
approach without replacing the migration ledger. Integration tests exercise
up, idempotent seed, down, and re-up behavior against pinned PostgreSQL.

## Reversal or migration strategy

Another engine can later import the ledger or baseline at a reviewed schema
version. SQL remains PostgreSQL-native. The initial down migration removes only
empty foundation schemas after later migrations have been reversed.

## Evidence and approvals

- Implementation ticket:
  [ARG-107](../tickets/ARG-107-data-foundation.md)
- Architecture and data boundaries:
  [architecture.md](../architecture.md) and [data-model.md](../data-model.md)
