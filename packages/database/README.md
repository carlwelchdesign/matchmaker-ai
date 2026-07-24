# `@argent/database`

Server-only PostgreSQL migration and synthetic-fixture boundary.

The package deliberately contains no applicant, profile, campaign, consent, or
matchmaking tables yet. Those schemas must follow their approved lifecycle and
privacy tickets. This foundation establishes:

- transaction-wrapped, advisory-locked migrations;
- separate application, restricted, audit, and system schemas;
- deterministic reference data and synthetic fixture provenance;
- production-safe seed refusal; and
- a reversible PostgreSQL integration smoke path.

Never import this package into web or mobile code. Never put real personal data
in fixtures.
