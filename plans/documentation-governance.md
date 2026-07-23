# Documentation Governance

## Metadata required for canonical documents

Before implementation, every canonical plan/runbook must have an owner, approver, status, last-reviewed date, next-review date, version, and superseded-source links where applicable.

## Sources of truth

- Product/architecture/security decisions: `/plans`.
- API contract: versioned OpenAPI source in the future contracts package.
- Generated Dart/TypeScript clients and API docs: generated from the contract and drift-checked.
- Ticket status: backlog CSV plus the active ticket file until a connected issue tracker becomes authoritative.
- Operational procedures: versioned runbooks linked from `operations.md`.
- Release changes: versioned release notes tied to commits, migrations, flags, and mobile compatibility.

## Required templates/artifacts

- ticket and ADR;
- AI use-case and metric definition;
- threat/privacy assessment;
- runbook;
- release note;
- post-incident review;
- provider feasibility record.

## Drift checks

CI should validate:

- internal links and required metadata;
- backlog CSV schema, unique IDs, and valid dependencies;
- ticket/master-checklist/traceability coverage;
- OpenAPI compatibility and generated-client cleanliness;
- current screenshots/examples for supported versions;
- runbook ownership for alerting rules;
- release-note presence for externally visible behavior.
