# ARG-104 — CI quality and security gates

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-007, CAP-008
- **Priority:** P0
- **Status:** In progress
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** M
- **Dependencies:** ARG-101, ARG-103
- **Decision/risk links:** R-020, R-032
- **Blocked reason/review date:** Remote required-check enforcement remains owned by ARG-100

## Outcome

Create named GitHub quality and security checks for repository verification,
secret detection, dependency review, CodeQL, container vulnerability scanning,
and release-grade container SBOM evidence.

## Scope

- Full monorepo verification on pushes and pull requests.
- Full-history secret scanning.
- Pull-request dependency vulnerability review.
- JavaScript/TypeScript CodeQL analysis.
- Matrix builds and high/critical vulnerability gates for application images.
- SPDX JSON SBOM artifacts for every application image.
- SHA-pinned third-party actions and a local enforcement check.
- Scheduled security rescans and Dependabot update coverage.

## Non-goals

- Remote branch-protection/reviewer policy (`ARG-100`).
- Deployment, signing, provenance attestation, or registry publication.
- Managed secrets and environment configuration (`ARG-106`).
- Production migration execution and container policy (`ARG-113`).

## Acceptance criteria

- [ ] Root verification runs on pull requests and `main`.
- [ ] Secret scanning examines complete repository history.
- [ ] New high-severity vulnerable dependencies are rejected.
- [ ] CodeQL analyzes JavaScript and TypeScript.
- [ ] Web, API, and worker images are built and scanned for high/critical vulnerabilities.
- [ ] Each application image produces an uploaded SPDX JSON SBOM.
- [ ] Every workflow declares least-privilege permissions and pins actions by full SHA.
- [ ] Weekly dependency and security refresh paths exist.
- [ ] Workflows pass local syntax/policy checks and run successfully on the ticket PR.
- [ ] Intended changes are committed and reviewed in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: Source, dependency metadata, and synthetic build artifacts only.
- Data-flow changes: Sends repository/build metadata to GitHub-hosted actions and public vulnerability databases.
- Roles/permissions: Workflow tokens are read-only except CodeQL `security-events: write`.
- Consent/retention: SBOM artifacts are retained for 14 days; no personal data.
- Deletion/revocation effects: Workflow artifacts expire automatically.
- Threats/abuse: Compromised actions, leaked secrets, vulnerable dependencies/images, unsafe privileged events.
- AI level and review: No AI.
- Accessibility: No user-interface change.
- Logging/redaction: Secret scanner must not print recovered secret values; no production payloads exist.

## Implementation checklist

- [x] Confirm gate boundaries and remote-governance ownership.
- [x] Pin all selected actions to verified release commits.
- [x] Add quality, secret, dependency, CodeQL, container, and SBOM workflows.
- [x] Add action/image pin-policy validation.
- [x] Add scheduled dependency update coverage.
- [x] Run local workflow syntax and policy validation.
- [ ] Exercise all workflows on the pull request and resolve failures.
- [ ] Update delivery evidence and move to review.

## Verification evidence

- [x] Focused tests: 11 TypeScript tests and 2 Flutter tests pass under Node
  `24.18.0`.
- [x] Static/quality checks: `pnpm verify`, Actionlint `1.7.12`,
  `pnpm ci:check`, Compose configuration validation, and `git diff --check`
  pass locally.
- [x] Security/privacy checks: Gitleaks `8.30.1` reports no leaks across full
  repository history; Trivy `0.70.0` reports 0 high and 0 critical findings
  for web, API, and worker images; the production dependency audit is clean.
- [ ] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: Disposable Docker smoke builds the three
  application images, starts all five services, verifies health/data paths,
  confirms non-root application users, and exercises graceful shutdown.
- [x] Rollout/rollback evidence: Workflows are additive and can be reverted as
  one ticket commit; immutable action and image pins preserve the reviewed
  inputs.

## Delivery evidence

- Branch: `ticket/ARG-104-ci-security`
- Commit:
- PR:
- Merge:
- Deployment: GitHub Actions only
- Evidence URLs/paths:
- Completion date:

## Completion notes

ARG-104 creates stable check names. ARG-100 must select those checks in branch
protection after repository owners and reviewer policy are approved.

Local Trivy validation rejected the prior Node 20 runtime because it contained
28 high/critical OS findings and vulnerable bundled package-manager tools. This
ticket therefore raises the exact runtime pin to Node 24 LTS and uses a
non-root distroless final image rather than weakening the vulnerability policy.
The Debian 12 distroless digest was also rejected after the scan identified
fixed OpenSSL findings; the final runtime uses a clean Debian 13 distroless
digest.

- Follow-up owner: ARG-100, ARG-111, ARG-113, and ARG-117
