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
- No repository call site or SDK integration exists yet; the live application behavior is unchanged.

## Acceptance criteria

- [ ] Server-only flag evaluation and typed definitions are implemented with a local deterministic fallback.
- [ ] `candidate-interviewing=false` always routes to the structured application or human-assistance path without losing resumable work.
- [ ] Authorization, consent, eligibility, retention, and provider kill switches remain enforced independently of flag state.
- [ ] Production and preview default off until their corresponding approval gates pass.
- [ ] Cohort targeting, override access, audit, owner, expiry/review date, and rollback runbook are documented.
- [ ] Flag evaluation volume and provider charges are monitored; no sensitive values enter flag attributes or telemetry.
- [ ] On/off, mid-session disable, provider outage, and stale-configuration tests pass.
- [ ] Development enablement uses synthetic data until the research protocol permits real participants.

## Rollout order

1. Synthetic development fixtures.
2. Internal preview cohort.
3. Approved research cohort.
4. Invited text-first beta.
5. Separately approved voice cohort.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).
