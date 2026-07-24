# Argent Matchmaking Planning System

## Purpose

This folder is the canonical source for product, architecture, security, delivery, and ticket planning for Argent Matchmaking.

Argent is a selective, human-led matchmaking platform for affluent clients. Anyone may apply, but admission is reviewed. Argent owns the platform and candidate network. Partner matchmakers may run controlled, co-branded campaigns with limited permissions; the product is not a general multi-tenant SaaS platform in its initial form.

No implementation ticket should begin until it satisfies the Definition of Ready in [delivery.md](delivery.md). Every completed ticket must update its checklist and record verification evidence.

## Planning goal

Deliver a secure, privacy-conscious private beta that supports:

- public campaign landing pages and applications;
- selective review, verification, acceptance, waitlisting, and decline workflows;
- Argent staff administration and controlled campaign operations;
- candidate profiles, matchmaking search, shortlists, introductions, and outcome tracking;
- bounded, human-reviewed AI assistance;
- a responsive web experience plus Flutter iOS and Android applications for workflows that benefit from mobile;
- Dockerized web, API, worker, and local infrastructure;
- deployment, observability, backup, recovery, and scaling foundations.

## Canonical documents

| Document | Purpose |
| --- | --- |
| [product.md](product.md) | Vision, users, positioning, jobs, principles, and success measures |
| [design-system.md](design-system.md) | Selected Nocturne direction, cross-platform tokens, governance, and approval gate |
| [mvp-scope.md](mvp-scope.md) | Private-beta scope, non-goals, assumptions, and release gates |
| [experience.md](experience.md) | Lifecycle, campaign, applicant, client, matchmaker, and partner workflows |
| [architecture.md](architecture.md) | Proposed system boundaries, monorepo, deployment, and scaling approach |
| [data-model.md](data-model.md) | Conceptual entities, ownership, lifecycle, and audit requirements |
| [security-privacy.md](security-privacy.md) | Security, privacy, consent, retention, and trust program |
| [ai-governance.md](ai-governance.md) | AI boundaries, evaluations, human review, and prohibited uses |
| [match-science.md](match-science.md) | Evidence review, construct policy, outcome taxonomy, and pre-implementation matching gate |
| [conversational-intake.md](conversational-intake.md) | Optional text/voice intake research, consent boundary, speech feasibility, and prototype gate |
| [operations.md](operations.md) | Reliability, support, incident response, and launch operations |
| [metrics.md](metrics.md) | Metric definitions, event lineage, attribution, and privacy requirements |
| [content-model.md](content-model.md) | Versioned campaign content, assets, taxonomies, and publishing |
| [documentation-governance.md](documentation-governance.md) | Sources of truth, ownership, templates, and drift checks |
| [traceability.md](traceability.md) | Capability-to-ticket, decision, risk, and evidence mapping |
| [delivery.md](delivery.md) | Roadmap, workflow, quality gates, and definitions of ready/done |
| [tickets/backlog.md](tickets/backlog.md) | Ordered delivery backlog and ticket checklists |
| [checklists/master.md](checklists/master.md) | Phase-level completion checklist |
| [risks.md](risks.md) | Owned product, legal, security, operational, and delivery risks |
| [decisions.md](decisions.md) | Architecture and product decision log |
| [reviews.md](reviews.md) | Specialist review findings and validation traceability |
| [validation.md](validation.md) | Current validation evidence and known repository prerequisite |
| [visuals/README.md](visuals/README.md) | Selected Nocturne specimen for public, staff, and mobile review |

## Status vocabulary

- `Proposed`: needs review or a decision.
- `Ready`: acceptance criteria and dependencies are resolved.
- `In progress`: work is active on a dedicated branch.
- `In review`: required checks passed and a PR is open.
- `Blocked`: a named dependency prevents progress.
- `Done`: merged, verified, documented, and checklist updated.
- `Deferred`: intentionally outside the current delivery phase.

## Branch and ticket workflow

1. Select the highest-priority unblocked ticket.
2. Confirm its scope, non-goals, dependencies, and acceptance criteria.
3. Create a branch named `ticket/ARG-###-short-description`.
4. Implement and verify only that ticket's coherent scope.
5. Update the ticket checklist with concrete evidence.
6. Commit with the ticket ID.
7. Open a PR linked to the ticket when a remote is configured.
8. Merge only after required review and checks.
9. Update the backlog, master checklist, decisions, and risks when affected.

Planning work uses `planning/*` branches. Application implementation uses ticket branches.

## Change policy

- Canonical decisions belong in this folder, not only in chat or PR comments.
- New scope requires a ticket and dependency review.
- Consequential AI actions remain human-reviewed.
- Matching is evidence-informed candidate discovery, not a prediction of attraction or relationship success.
- Conversational intake is optional and may only create user-reviewed, source-grounded profile proposals.
- Partner campaigns never bypass Argent authorization or data-governance rules.
- Sensitive data must not appear in logs, analytics payloads, fixtures, screenshots, or model prompts without an approved purpose and handling policy.
