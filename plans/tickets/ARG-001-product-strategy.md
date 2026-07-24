# ARG-001 — Approve product strategy and pilot promise

- **Epic:** Product strategy
- **Capability/requirement IDs:** CAP-001; CAP-002; CAP-003; CAP-004
- **Priority:** P0
- **Status:** Proposed
- **Named owner:** Project owner
- **Named approver/reviewer:** Project owner
- **Target milestone:** Decision gate
- **Estimate band:** S
- **Dependencies:** ARG-000
- **Decision/risk links:** DEC-002; DEC-003; DEC-004; DEC-008; DEC-009;
  R-002; R-019; R-021; R-023; R-025
- **Blocked reason/review date:** Awaiting project-owner review of four
  recommendations

## Outcome

Give research, design, legal, operations, and engineering one explicit,
testable product hypothesis without prematurely approving pricing, promises,
eligibility, or implementation.

## Scope

- Confirm the beachhead client and problem.
- Decide who pays and whether candidates pay to be considered.
- Approve the pilot service-promise boundary.
- Approve the local proof hypothesis and evidence categories.
- Preserve explicit downstream owners for pricing, policy, legal, research, and
  metric thresholds.

## Non-goals

- Exact price, package, contract, refund, or referral compensation.
- Admission, verification, invite, quota, or waitlist policy.
- Final campaign copy or gender/relationship eligibility.
- A competitor-success claim, predictive matching claim, or technical design.
- Implementation or collection of real applicant/client data.

## Acceptance criteria

- [x] Confirmed founder direction is separated from recommendations.
- [x] Beachhead ICP is framed by needs and service fit, not demographic
  stereotypes or presumed personality.
- [x] Payer/candidate relationship has a clear recommendation.
- [x] Controlled service promises and prohibited guarantees are explicit.
- [x] Pilot hypothesis separates acquisition targets from success measures.
- [x] Market check uses current first-party sources and labels marketing claims
  as unverified.
- [x] Pricing, policy, legal, research, and metric decisions remain assigned to
  downstream tickets.
- [ ] Project owner approves or revises each of the four recommendations.
- [ ] Approved decisions are reflected in canonical product, scope, decision,
  risk, and backlog documents.
- [ ] Intended changes are reviewed and merged in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: Planning information only; no personal data.
- Data-flow changes: None.
- Roles/permissions: Product owner is the decision authority.
- Consent/retention: No participant data collection is authorized.
- Deletion/revocation effects: Not applicable.
- Threats/abuse: Pay-to-play matching, misleading guarantees, elitist or
  discriminatory criteria, scope inflation, and copied competitor claims.
- AI level and review: No AI product behavior; decision preserves human
  authority and prohibits predictive compatibility claims.
- Accessibility: Research must include people who need alternate interaction
  modes; no UI is approved here.
- Logging/redaction: Not applicable.

## Implementation checklist

- [x] Confirm dependency completion.
- [x] Reconcile existing product/scope/experience material.
- [x] Perform a current first-party market-position check.
- [x] Prepare explicit recommendations and defer unresolved decisions.
- [ ] Obtain project-owner decisions.
- [ ] Update canonical approved documents and decision log.

## Verification evidence

- [x] Focused review:
  [product strategy decision packet](../product-strategy-decision.md)
- [x] Static/quality checks: Repository formatting and `git diff --check` pass.
- [x] Security/privacy checks: No real applicant/client data or operational
  access is introduced.
- [x] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: Not applicable; planning only.
- [x] Rollout/rollback evidence: Recommendations can be revised before approval;
  downstream tickets remain gated.

## Delivery evidence

- Branch: `planning/ARG-001-product-strategy`
- Commit:
- PR:
- Merge:
- Deployment: Planning only
- Evidence URLs/paths:
- Completion date:

## Completion notes

Merging the decision packet does not mark ARG-001 `Done`. The ticket remains
`Proposed` until the project owner records a decision on all four
recommendations.

- Follow-up owner: Project owner, then ARG-002/ARG-003/ARG-005/ARG-006/ARG-010
  and ARG-011 owners
