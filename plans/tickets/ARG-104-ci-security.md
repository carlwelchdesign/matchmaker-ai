# ARG-104 — CI quality and security gates

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-007, CAP-008
- **Priority:** P0
- **Status:** Done
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** M
- **Dependencies:** ARG-101, ARG-103
- **Decision/risk links:** R-020, R-032
- **Blocked reason/review date:** Not blocked; remote required-check enforcement remains owned by ARG-100

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

- [x] Root verification runs on pull requests and `main`.
- [x] Secret scanning examines complete repository history.
- [x] New high-severity vulnerable dependencies are rejected.
- [x] CodeQL analyzes JavaScript and TypeScript.
- [x] Web, API, and worker images are built and scanned for high/critical vulnerabilities.
- [x] Each application image produces an uploaded SPDX JSON SBOM.
- [x] Every workflow declares least-privilege permissions and pins actions by full SHA.
- [x] Weekly dependency and security refresh paths exist.
- [x] Workflows pass local syntax/policy checks and run successfully on the ticket PR.
- [x] Intended changes are committed and reviewed in a ticket PR.

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
- [x] Exercise all workflows on the pull request and resolve failures.
- [x] Update delivery evidence and close the ticket.

## Verification evidence

- [x] Focused tests: 11 TypeScript tests and 2 Flutter tests pass under Node
  `24.18.0`.
- [x] Static/quality checks: `pnpm verify`, Actionlint `1.7.12`,
  `pnpm ci:check`, Compose configuration validation, and `git diff --check`
  pass locally.
- [x] Security/privacy checks: Gitleaks `8.30.1` reports no leaks across full
  repository history; Trivy `0.70.0` reports 0 high and 0 critical findings
  for web, API, and worker images; the production dependency audit is clean.
- [x] Accessibility/visual checks: Not applicable; no UI change.
- [x] Runtime/deployment checks: Disposable Docker smoke builds the three
  application images, starts all five services, verifies health/data paths,
  confirms non-root application users, and exercises graceful shutdown.
- [x] Rollout/rollback evidence: Workflows are additive and can be reverted as
  one ticket commit; immutable action and image pins preserve the reviewed
  inputs.

## Delivery evidence

- Branch: `ticket/ARG-104-ci-security`
- Commit: `75ea049e2937406dbd022a706d43eaa059cd3400`
- PR: [#8](https://github.com/carlwelchdesign/matchmaker-ai/pull/8)
- Merge: `422bb4ec483fb64b40e03fb16778874034f39c92`
- Deployment: GitHub Actions only
- Evidence URLs/paths:
  - [PR checks](https://github.com/carlwelchdesign/matchmaker-ai/pull/8/checks)
  - [Quality on main](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30069298551)
  - [Security on main](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30069298560)
  - [Secret scan on main](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30069298570)
  - [Container scans and SBOMs on main](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30069298576)
- Completion date: 2026-07-23

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

Enabling GitHub's dependency graph exposed two pre-existing development-only
`shell-quote` alerts that the package audit did not report. A narrow resolution
override raises the transitive package to patched version `1.9.0`; GitHub alert
closure is part of the completion evidence.

- Follow-up owner: ARG-100, ARG-111, ARG-113, and ARG-117
