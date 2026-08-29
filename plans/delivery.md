# Delivery and Governance Plan

## Delivery phases

### Milestone A — Operational alpha

Entry: Phase 0 decisions approved. Exit: synthetic-data end-to-end web/concierge workflow rehearsed with deterministic search and manual fallbacks.

### Milestone B — Consenting service pilot

Entry: critical trust/security/legal gates passed. Exit: one bounded cohort and campaign completed with aggregate-only partner reporting and measured operations.

### Milestone C — Private beta

Entry: service hypothesis and human workflow validated. Exit: governed AI and selected Flutter workflows satisfy their own quality and store gates.

### Milestone D — Expansion

Entry: pilot/private-beta decision thresholds met. Scope is separately approved.

## Delivery phases

### Phase 0 — Decisions and risk reduction

Validate the operating model, workflows, brand, legal/privacy posture, security model, provider feasibility, architecture, and success measures.

### Phase 1 — Engineering foundation

Create the monorepo, contracts, cross-platform design-token foundation, Docker development environment, CI/CD, environments, identity, permissions, audit, observability, and data-protection foundations.

### Phase 2 — Application and campaign intake

Deliver public campaign pages, applications, uploads, consent, invite/referral attribution, campaign operations, review queues, interviews, verification orchestration, status, and notifications.

### Phase 3 — Matchmaking operations

Deliver client/candidate profiles, criteria, search, shortlists, recommendations, mutual approval, introductions, feedback, outcomes, safety, and support workflows.

### Phase 4 — Governed AI assistance

Add summaries, data-quality assistance, candidate retrieval, match suggestions, evaluations, monitoring, prompt/version control, and human override evidence.

### Phase 5 — Flutter member experience

Deliver secure mobile onboarding, profile/privacy controls, introduction decisions, notifications, feedback, support, safety, and store compliance.

### Phase 6 — Pilot/private-beta launch readiness

Complete accessibility, performance, security, privacy/legal, operational, disaster-recovery, app-store, and controlled-campaign gates.

## Ticket hierarchy

- **Initiative:** private-beta launch.
- **Epic:** a durable outcome area such as trust, campaigns, or matchmaking.
- **Ticket:** independently reviewable user/operational value with acceptance criteria.
- **Task:** checklist item inside a ticket.

Tickets live in [tickets/backlog.md](tickets/backlog.md). Create a dedicated file from [templates/ticket.md](templates/ticket.md) when a ticket enters `Ready`.

The backlog contains future work as well as current milestone work. Priority is meaningful only within an approved milestone; future P1/P2 work does not block an earlier milestone.

## Definition of Ready

A ticket may enter implementation only when:

- the user/operational outcome is stated;
- scope and non-goals are explicit;
- acceptance criteria are testable;
- security, privacy, AI, accessibility, and data impacts are reviewed;
- API/data/permission dependencies are identified;
- external-provider assumptions are verified or gated;
- designs or copy exist when necessary;
- user-facing work references the approved semantic tokens, component states, responsive behavior, and platform adaptation rules;
- required user research or prototype evidence exists for user-facing workflows;
- dependencies are `Done` or a fallback is approved;
- verification evidence is specified;
- an owner and reviewer are assigned.

## Definition of Done

A ticket is `Done` only when:

- acceptance criteria are met;
- focused tests and required broader checks pass;
- authorization and negative-path tests pass where relevant;
- privacy/security logging and redaction are verified;
- responsive/accessibility states are checked where relevant;
- migrations and rollback/recovery are addressed;
- operational metrics/runbooks are updated;
- documentation, decisions, risks, and API contracts are updated;
- the ticket checklist contains evidence links or commands/results;
- intended changes are committed and reviewed;
- the PR is merged into the required base branch;
- deployed behavior is verified when deployment is in scope.

## Required ticket states

`Proposed → Ready → In progress → In review → Done`

Exceptional states: `Blocked`, `Deferred`, `Cancelled`.

## Workflow authority, maturity, and WIP

- Asana project `1217038055360286` is authoritative for operational workflow
  status and section placement. The repository is authoritative for durable
  scope, dependencies, acceptance criteria, decisions, and evidence.
- [delivery-state.json](delivery-state.json) is a versioned reconciliation
  snapshot, not a substitute for querying Asana. Update it whenever the active
  ticket changes and resolve a mismatch before starting new work.
- Delivery status answers whether work is authorized and active. Artifact
  maturity independently describes what the evidence proves, for example:
  planning control, research evidence, synthetic contract, synthetic prototype,
  integrated system, human-validated workflow, or production-verified behavior.
  A mature synthetic artifact does not make its parent ticket active or Done.
- WIP is limited to one parent ticket and its subtasks. Only the parent appears
  as `In progress` in the project section and repository backlog; subtasks do not
  create additional top-level WIP slots.
- A workflow mismatch blocks new implementation. Preserve evidence, reconcile
  status with owner approval, record artifact maturity separately, refresh the
  snapshot, and rerun planning validation.
- A dependency exception must use the exact repository convention
  `Approved dependency waiver (YYYY-MM-DD; approver: NAME; scope: SCOPE)` and
  must not authorize work outside that scope.
- A blocked ticket records `owner: NAME; review: YYYY-MM-DD; fallback: ACTION`
  in its backlog reason until ARG-024 introduces richer traceability fields.

## Branch, commit, and PR policy

- Branch: `ticket/ARG-###-short-description`
- Commit: `ARG-###: concise outcome`
- PR title: `ARG-### — concise outcome`
- Keep one coherent ticket per branch unless an approved delivery decision says otherwise.
- Use squash merge by default once a remote and review workflow exist.
- Never merge with required checks failing.
- Planning changes use `planning/*` branches and cite affected decisions/tickets.

## Ticket transition authority

- Product owner approves `Proposed → Ready`.
- Assigned owner moves `Ready → In progress`.
- Reviewer moves work to `In review` only when evidence is present.
- Merge authority marks `Done` after merge and required deployment verification.
- `Blocked` requires a reason, owner, review date, and fallback.
- Reopening requires failed acceptance evidence or a linked regression.
- Cancellation requires product owner approval and impact review.
- The assigned owner confirms that the Asana section, backlog status, and
  `delivery-state.json` snapshot agree before beginning work.

## Quality gates

Every implementation ticket selects proportionate checks from:

- unit, contract, integration, and end-to-end tests;
- type/static analysis and linting;
- dependency, secret, container, and infrastructure scans;
- authorization matrix and negative tests;
- migration forward/backward compatibility;
- performance and load checks;
- responsive visual checks;
- keyboard, screen reader, focus, contrast, and reduced-motion checks;
- AI evaluation and red-team regression;
- logs/metrics/traces and PII-redaction review;
- backup, rollback, or recovery exercise.

## Decision process

Material choices use an ADR:

1. context and decision deadline;
2. considered options;
3. security/privacy/operational implications;
4. decision and rationale;
5. consequences and reversal strategy;
6. approval and review date.

## RACI seed

Actual people must be assigned before implementation.

| Area | Accountable | Responsible | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Product and admission policy | Founder | Product lead | Matchmakers, legal, design | Delivery team |
| Architecture | Engineering lead | Ticket engineer | Security, mobile, operations | Product |
| Security | Security owner | Engineering lead | Privacy/legal, provider owners | Founder |
| Privacy/consent | Privacy owner | Product + engineering | Legal counsel, matchmakers | Support |
| AI governance | Product owner | AI engineering owner | Matchmakers, privacy, security | Support |
| Campaign launch | Founder | Campaign operator | Partner, support, engineering | Participants |
| Incidents | Incident owner | On-call engineer | Security/privacy/legal | Leadership |
| Mobile release | Engineering lead | Mobile owner | Product, QA, privacy | Support |

## Planning cadence

- Update ticket checklists during work, not afterward from memory.
- Review risks and decisions at least weekly during active delivery.
- Reorder the backlog only with dependency and launch-impact review.
- Run a release-gate review at the end of each phase.
- Capture newly discovered work as tickets before implementing it.
- Keep backlog CSV, ticket file, master checklist, risks, decisions, traceability, and deployment evidence synchronized before `Done`.
- Add CI checks for CSV validity, links, generated contracts/docs, and checklist/traceability drift.
