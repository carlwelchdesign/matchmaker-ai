# Documentation Governance

## Metadata required for canonical documents

Before implementation, every canonical plan/runbook must have an owner, approver, status, last-reviewed date, next-review date, version, and superseded-source links where applicable.

## Sources of truth

- Product/architecture/security decisions: `/plans`.
- API contract: versioned OpenAPI source in the future contracts package.
- Generated Dart/TypeScript clients and API docs: generated from the contract and drift-checked.
- Operational ticket status and section placement: Asana project
  `1217038055360286`.
- Durable ticket scope, dependencies, acceptance, decisions, and evidence:
  backlog CSV plus the active ticket file.
- Workflow reconciliation and artifact maturity: versioned
  [delivery-state.json](delivery-state.json), refreshed from Asana whenever the
  active ticket changes. A mismatch blocks new work until owner review.
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

CI validates the first documentation-governance slice with `pnpm plans:check`.
That check currently covers:

- backlog CSV schema, unique IDs, and valid dependencies;
- dependency cycles;
- ticket-file status drift against `backlog.csv`;
- `backlog.md` coverage and `Done` checklist state;
- local Markdown links under `/plans`.
- single top-level WIP, active-ticket readiness, structured dependency waivers,
  structured blocked-ticket metadata, estimate-band values, and agreement
  between the backlog and `delivery-state.json`.

Later `ARG-024` traceability work should extend this to cover:

- internal links and required metadata;
- ticket/master-checklist/traceability coverage;
- OpenAPI compatibility and generated-client cleanliness;
- current screenshots/examples for supported versions;
- runbook ownership for alerting rules;
- release-note presence for externally visible behavior.
