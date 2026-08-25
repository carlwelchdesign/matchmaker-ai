# ARG-111 — Feature flags and safe rollout controls

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-007, CAP-010
- **Priority:** P0
- **Status:** Proposed
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned platform, product, security, and privacy reviewers
- **Target milestone:** Private beta
- **Estimate band:** M
- **Dependencies:** ARG-105, ARG-106, ARG-108
- **Decision/risk links:** DEC-020, R-030, R-043

## Outcome

Risky capabilities can be enabled for explicit cohorts, measured, stopped, and safely returned to a deterministic fallback without weakening authorization or consent.

## Current evidence

- Vercel boolean flag `candidate-interviewing` created for `montecito-matchmaker` on 2026-08-24.
- Production: off.
- Preview: off.
- Development: on.
- The `/prototype` server page evaluates the typed flag before rendering the
  client application. `candidate-interview-flag-policy/v1` enables only an
  explicit boolean `true`; false, malformed values, and evaluation errors fail
  closed without storing sensitive flag attributes.
- Without provider configuration, the local adapter enables only in the
  development environment. The synthetic application boundary remains in
  force; no real-person rollout is authorized.

## Acceptance criteria

- [x] Server-only flag evaluation and typed definitions are implemented with a local deterministic fallback.
- [ ] `candidate-interviewing=false` always routes to the structured application or human-assistance path without losing resumable work.
- [ ] Authorization, consent, eligibility, retention, and provider kill switches remain enforced independently of flag state.
- [ ] Production and preview default off until their corresponding approval gates pass.
- [ ] Cohort targeting, override access, audit, owner, expiry/review date, and rollback runbook are documented.
- [ ] Flag evaluation volume and provider charges are monitored; no sensitive values enter flag attributes or telemetry.
- [ ] On/off, mid-session disable, provider outage, and stale-configuration tests pass.
- [x] Development enablement uses synthetic data until the research protocol permits real participants.

## Current development increment

- Branch: `codex/ARG-111-flag-evaluation`
- Runtime boundary: server page evaluation plus pure typed policy; no sensitive
  targeting attributes, persistence, provider logging, or client-side flag SDK
- Tests: explicit on, explicit off, malformed/stale-shaped values, and provider
  error all resolve deterministically; every non-true state fails closed
- When an on-to-off availability signal reaches the application, it snapshots
  completed exact-source answers into the existing structured fallback with
  reason `feature-kill-switch`.
  Initial-off and enabled states do not invent a transition; once disabled, the
  fixed Sunrise guide remains active until the candidate explicitly begins
  again or chooses another approach.
- Verification: 70 web tests across 15 files, web TypeScript, production build,
  planning validation, formatting, diff checks, rebuilt local web container,
  and `/prototype` HTTP 200
- Still open: live flag refresh/polling, independent authorization and consent
  enforcement, production/preview configuration verification, cohort
  governance, audit/expiry, evaluation-volume monitoring, and rollback drills

## Rollout order

1. Synthetic development fixtures.
2. Internal preview cohort.
3. Approved research cohort.
4. Invited text-first beta.
5. Separately approved voice cohort.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
