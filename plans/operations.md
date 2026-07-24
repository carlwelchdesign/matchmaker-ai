# Operations, Reliability, and Support Plan

## Service objectives

Private-beta SLOs must be set from realistic support capacity. Initial candidates:

- application and staff workflows available during published service hours;
- no acknowledged loss of submitted applications or consequential decisions;
- critical security alerts triaged immediately under the incident plan;
- notification and AI delays surfaced honestly rather than appearing successful;
- privacy and safety requests prioritized over ordinary support.

Before staging approval, convert these into measurable SLIs/SLOs with owner, query, threshold, window, alert, error budget, and degradation behavior. Required areas include web/API availability and latency, queue age/depth by class, provider callback lag, notification delivery, database saturation, privacy-request completion, restore objectives, and AI latency/cost/quality.

## Operational ownership

Name owners for:

- production change approval;
- incident command;
- security and privacy escalation;
- applicant/member support;
- partner campaign support;
- AI quality and cost;
- database and backup health;
- provider/vendor management;
- mobile release management.

## Runbooks required before beta

- application/API outage;
- queue backlog;
- database saturation or failover;
- failed deployment and rollback;
- lost or exposed credential;
- compromised account;
- accidental partner access;
- media exposure;
- notification provider outage;
- AI provider outage or unsafe output;
- verification provider disagreement;
- privacy request failure;
- restore from backup;
- mobile release rollback/feature disablement.
- transactional outbox/inbox replay and poison-message quarantine;
- analytics pipeline delay, backfill, and deletion-propagation failure;
- database migration failure with older mobile clients still active.

## Backup and recovery

- Define RPO and RTO by data class.
- Encrypt backups and restrict restore access.
- Test point-in-time database restore.
- Test object-storage recovery and deletion propagation.
- Document how restored data reconciles consent withdrawals and deletions.
- Maintain immutable audit evidence appropriate to threat model and policy.

## Release management

- Trunk/main remains releasable.
- Feature flags protect incomplete or high-risk workflows.
- Database migrations are backward-compatible and rehearsed.
- Deployments have smoke checks and rollback criteria.
- Mobile APIs remain compatible with supported app versions.
- Release notes include user, operator, privacy, and migration impact.
- Supported mobile versions, capability negotiation, and forced-upgrade rules are monitored operationally.

## Support tooling

Support access must be scoped and audited. Tools should allow:

- search by safe identifiers;
- view account/application state without unnecessary sensitive fields;
- resend safe transactional notifications;
- revoke sessions;
- escalate privacy, safety, verification, or billing issues;
- see provider delivery state;
- record reasoned administrative actions.

Impersonation is prohibited unless a separately designed, visible, time-limited, and audited mechanism is approved.

## Capacity and load

Define and test:

- campaign traffic spikes;
- concurrent application saves/submissions;
- media upload volume;
- staff review concurrency;
- search and shortlist latency;
- notification bursts;
- AI job queue depth and cost ceilings;
- database connections and storage growth.

## Launch process

1. Internal synthetic-data rehearsal.
2. Closed usability and operational pilot.
3. Consenting beta cohort.
4. Security/privacy/legal gate review.
5. Controlled campaign launch with daily monitoring.
6. Retrospective and go/no-go decision before expansion.
