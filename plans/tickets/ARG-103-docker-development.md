# ARG-103 — Reproducible Docker development environment

- **Epic:** Platform foundation
- **Capability/requirement IDs:** CAP-007, CAP-008
- **Priority:** P0
- **Status:** Done
- **Named owner:** Codex
- **Named approver/reviewer:** Project owner
- **Target milestone:** Operational alpha
- **Estimate band:** S
- **Dependencies:** ARG-101
- **Decision/risk links:** ADR-001, ADR-002, R-008, R-015, R-020
- **Blocked reason/review date:** None

## Build-context remediation — 2026-07-23

Post-completion review found that Git ignored local environment files but the
Docker build context did not. A developer's untracked `.env.local` or common
private-key file could therefore be sent to a local or remote BuildKit builder
and retained in build cache even though it never reached the final image.
ARG-103 is reopened narrowly until sensitive context patterns are excluded,
non-secret `.env.example` files remain available, the policy is enforced in
CI, and the container smoke path passes remotely.

The remediation is complete. Pull request
[#25](https://github.com/carlwelchdesign/matchmaker-ai/pull/25) was
squash-merged as `98ec9acf08d97a3aa1204fb8f2a00f77e226f8d4`. A Docker
sentinel build proved that root and nested secret-like environment files were
absent from the build workspace while `.env.example` remained available.

## Outcome

Provide a pinned, isolated, non-root Docker environment for the web, API,
worker, PostgreSQL, and Redis, plus one disposable end-to-end smoke path.

## Scope

- Multi-stage web, API, and worker image targets.
- Pinned multi-architecture application and data-service images.
- Non-root application processes and restricted container privileges.
- Local-only published ports and isolated persistent volumes.
- Health checks and dependency-aware startup.
- Automated build, response, startup, and graceful-shutdown smoke checks.

## Non-goals

- Production cloud topology or infrastructure-as-code (`ARG-108`).
- CI container scanning and branch gates (`ARG-104`).
- Database schema/migrations, queue wiring, or application readiness.
- Mobile containerization.

## Acceptance criteria

- [x] Compose configuration validates.
- [x] Web, API, and worker images build from a clean context.
- [x] Application containers run as non-root with reduced privileges.
- [x] Web, API, PostgreSQL, Redis, and worker health checks pass.
- [x] The web and API respond through loopback-only published ports.
- [x] Worker startup and graceful API/worker shutdown are verified.
- [x] The disposable smoke project removes its containers and volumes.
- [x] Existing root verification and production dependency audit remain green.
- [x] Intended changes are committed and reviewed in a ticket PR.

## Security, privacy, AI, data, and accessibility

- Data classes: Synthetic local state only; no personal data.
- Data-flow changes: Adds an isolated local container network and loopback ports.
- Roles/permissions: No application authorization change.
- Consent/retention: Smoke volumes are deleted; developer volumes persist until explicitly removed.
- Deletion/revocation effects: `docker compose down --volumes` removes local stack state.
- Threats/abuse: Mutable tags, root containers, broad host exposure, leaked credentials, stale volumes.
- AI level and review: No AI.
- Accessibility: Existing foundation web response is exercised; no UI change.
- Logging/redaction: Lifecycle and health data only.

## Implementation checklist

- [x] Pin application and supporting-service images.
- [x] Add multi-stage application image targets.
- [x] Add restricted Compose services, health checks, network, and volumes.
- [x] Add an isolated end-to-end smoke script.
- [x] Document normal and disposable workflows.
- [x] Run configuration, image, runtime, cleanup, and regression checks.
- [x] Inspect image users, privileges, sizes, and dependency contents.
- [x] Update delivery evidence and move to review.

## Verification evidence

- [x] Focused tests: Disposable five-service Docker smoke passes; existing 11 TypeScript and 2 Flutter tests pass.
- [x] Static/quality checks: Compose validation, Prettier, strict TypeScript, Flutter analysis, builds, contract drift, and `git diff --check` pass.
- [x] Security/privacy checks: Application images run as UID 65532 with
  read-only roots, all capabilities dropped, no-new-privileges, loopback port
  binds, pinned image digests, excluded secret-like build-context files, and no
  test/source deployment artifacts; production dependency audit and remote
  image scans report no known high/critical vulnerabilities.
- [x] Accessibility/visual checks: Not applicable; no UI change. The existing
  web response is smoke-tested.
- [x] Runtime/deployment checks: Five services become healthy; web/API/data probes, worker start, API/worker graceful stop, and isolated volume cleanup pass. Final image sizes are 74.5 MB web, 72.9 MB API, and 71.2 MB worker.
- [x] Rollout/rollback evidence: Local-only additive environment; rollback removes Compose/Docker definitions. Smoke state is synthetic and automatically destroyed.

## Delivery evidence

- Branch: `ticket/ARG-103-docker-development`
- Commit: `016e07f` (`ARG-103: add reproducible Docker environment`)
- PR: [#6 — ARG-103 — Add reproducible Docker environment](https://github.com/carlwelchdesign/matchmaker-ai/pull/6)
- Merge: PR #6 squash-merged as `32ea1f8`
- Deployment: Local Docker only
- Evidence URLs/paths:
  - [Build-context remediation and container smoke](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30073877734)
  - [Remediation repository verification](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30073877813)
  - [Remediation security checks](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30073877757)
  - [Remediation secret scan](https://github.com/carlwelchdesign/matchmaker-ai/actions/runs/30073877778)
- Completion date: 2026-07-23

## Completion notes

PostgreSQL and Redis are healthy supporting services in this slice but are not
yet application dependencies. The API liveness route still does not claim
dependency readiness.

Build-context remediation delivery:

- Commit: `2df07454548c4027999e0d71644bcb1f49e5af0b`
- PR: [#25](https://github.com/carlwelchdesign/matchmaker-ai/pull/25)
- Merge: `98ec9acf08d97a3aa1204fb8f2a00f77e226f8d4`

- Follow-up owner: ARG-104 and ARG-108
