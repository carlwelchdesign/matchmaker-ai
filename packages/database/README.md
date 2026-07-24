# `@argent/database`

Server-only PostgreSQL migration, synthetic-fixture, and durable
event-delivery boundary.

The package deliberately contains no applicant, profile, campaign, consent, or
matchmaking tables yet. Those schemas must follow their approved lifecycle and
privacy tickets. This foundation establishes:

- transaction-wrapped, advisory-locked migrations;
- separate application, restricted, audit, and system schemas;
- deterministic reference data and synthetic fixture provenance;
- production-safe seed refusal; and
- transactional outbox records with concurrent expiring leases;
- verified, deduplicated webhook receipts;
- idempotent durable job registration; and
- a reversible PostgreSQL integration smoke path.

Never import this package into web or mobile code. Never put real personal data
in fixtures. Event and job payloads must be minimized, schema-versioned, and
must not contain raw webhook bodies, signatures, credentials, or free-form
errors.
