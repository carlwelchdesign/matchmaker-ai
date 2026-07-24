# Security, Privacy, and Trust Plan

## Security objective

Protect people from unauthorized disclosure, misuse, manipulation, fraud, unsafe introductions, and irreversible automated decisions. Security and privacy are release gates, not post-launch enhancements.

## Governance

- Name a security owner and privacy owner before implementation.
- Obtain qualified legal/privacy review for notices, consent, screening, partner terms, retention, and jurisdictional obligations.
- Maintain a data inventory, processing-purpose register, subprocessor list, and system diagram.
- Complete threat modeling before final architecture approval and before every material integration.
- Record exceptions with owner, expiration, compensating controls, and approval.

## Identity and access

- Use a vetted identity provider supporting MFA, secure recovery, session revocation, and risk controls.
- Require phishing-resistant MFA for privileged staff where practical.
- Implement deny-by-default RBAC with object/scope checks.
- Separate applicant/member, staff, administrator, support, and partner permissions.
- Require re-authentication for sensitive exports, credential changes, and destructive privacy actions.
- Review privileged access periodically and immediately revoke departed users.
- Provide audited break-glass access with time limits and post-event review.

## Application security

- Follow current OWASP application and API practices during implementation.
- Validate all input at trust boundaries and encode output by context.
- Use CSRF protection where cookie authentication is used.
- Apply rate limits, abuse detection, and bot controls to public endpoints.
- Use idempotency for consequential mutations.
- Protect against insecure direct-object access with server-side authorization on every request.
- Scan dependencies, containers, infrastructure, and secrets in CI.
- Generate and review an SBOM for releases.
- Conduct independent penetration testing before real private data is accepted.

## Data protection

- Encrypt transport and managed storage.
- Use field-level or envelope encryption where threat modeling justifies it.
- Keep secrets in a managed secret store, never repositories or mobile binaries.
- Isolate production from development and prohibit production personal data in lower environments.
- Use synthetic fixtures.
- Restrict database and object-storage networks and credentials by workload.
- Use short-lived signed media access, malware scanning, type/size validation, and metadata stripping.
- Redact logs, traces, analytics, crash reports, and support tooling.

## Privacy and consent

Capture distinct, versioned choices for:

- applying to a specific campaign;
- consideration for Argent's broader network;
- sharing with a named partner or matchmaker;
- identity or background verification;
- interview recording or transcription;
- conversational-intake recording, transcription, source retention, and AI structuring as distinct choices;
- transactional communications;
- marketing communications;
- AI processing where disclosure or consent is required;
- future reuse of de-identified or aggregate information.

Do not bundle optional permissions into acceptance of required service terms.

## Conversational intake controls

- Recording is off by default, explicitly started and stopped for each response, and visibly active.
- Counsel defines jurisdiction-specific notice and all-party consent behavior before testing with real applicants.
- Typed and human-assisted alternatives remain available without admission penalty.
- Raw audio, transcript revisions, approved fields, and research reuse have separate purposes and retention.
- Raw audio is ephemeral by default; retained audio requires an approved purpose and short maximum retention.
- Bystander or third-party speech is rejected, deleted, or handled through a counsel-approved path.
- Speech vendors may not train on Argent data; on-device processing is preferred when target-device testing supports it.
- Voiceprints, emotion recognition, accent classification, deception detection, and psychological inference are prohibited.
- Transcripts are corrected by the applicant before AI structuring; proposed fields require field-level approval.
- Withdrawal and deletion propagate through audio, transcripts, proposals, approved fields, search indexes, AI artifacts, and subprocessors.

## Privacy rights workflow

Support authenticated requests for:

- access;
- correction;
- consent withdrawal;
- communication preference changes;
- profile deactivation;
- portability/export where applicable;
- deletion subject to documented legal/security exceptions.

Requests need identity verification, deadlines, review, fulfillment evidence, and downstream propagation.

## Consent withdrawal and invalidation

Purpose-specific withdrawal immediately prevents new processing for that purpose. The approved matrix must define an SLA and effect for:

| Surface | Required effect |
| --- | --- |
| Partner access | Revoke grants and invalidate active sessions/caches |
| Media | Revoke signed access and queue deletion where applicable |
| Search/vector indexes | Remove or suppress affected material |
| Intake audio/transcripts | Stop processing, revoke access, delete eligible source artifacts, and invalidate unapproved proposals |
| Queued jobs | Cancel or fail closed before execution |
| AI artifacts | Mark invalidated and prevent reuse; request provider deletion where applicable |
| Shortlists/recommendations | Re-evaluate availability and prevent new introductions |
| Exports | Record recipients and trigger required downstream action |
| Subprocessors | Send deletion/restriction request and retain receipt |
| Backups/restores | Reapply deletion/withdrawal ledger after restore |
| Legal holds | Record the narrow exception, authority, access, and eventual disposition |

## Retention

Before production, every entity/data class requires:

- purpose;
- minimum retention;
- maximum retention;
- deletion or anonymization method;
- legal hold behavior;
- backup expiration behavior;
- downstream provider deletion behavior;
- owner and review date.

Applicants who are declined or withdraw should not silently remain available for matching.

Audio and transcript retention are not inherited from the submitted application. Each requires its own approved minimum/maximum period, access scope, deletion verification, provider behavior, and legal-hold rule.

## Partner campaign controls

- Campaign partners receive no implicit access to applicant data.
- Access is specific to campaign, object type, purpose, and duration.
- Partners accept contractual confidentiality, security, incident, deletion, and subprocessing terms.
- Bulk export is disabled by default.
- Campaign closure triggers access review and retention actions.
- All partner reads and exports of sensitive records are auditable.
- Pilot partner reporting is aggregate-only with minimum-cohort suppression to reduce re-identification.
- Any later person-level grant specifies campaign, person/object, fields, actions, purpose, approver, start/end, and subject disclosure.
- Emergency revocation invalidates sessions, tokens, caches, and signed access within an approved SLA.

## Verification and screening

- Clearly state what each badge or status verifies.
- Do not imply that identity or background screening guarantees safety.
- Minimize raw screening data; prefer provider status and adjudication metadata where lawful and sufficient.
- Establish dispute, correction, appeal, expiration, and re-screening workflows.
- Restrict screening decisions and reasons to trained roles.

## Rights and content governance

Define ownership, license, permitted use, takedown, dispute, correction, withdrawal, and post-withdrawal treatment for:

- applicant/client photos and documents;
- professional photography and third-party assets;
- partner names, marks, copy, and campaign media;
- interview recordings and transcripts;
- AI-generated drafts and derived profile copy;
- profile exports and matchmaker collaboration;
- testimonials and campaign success stories.

Published material must retain rights provenance and approval evidence.

## Safety and abuse

- Reporting and blocking paths must be easy to find.
- Define severity, response targets, evidence handling, escalation, and emergency limitations.
- Maintain anti-impersonation, invite-abuse, scraping, credential-stuffing, and harassment controls.
- Provide staff guidance for threats, stalking, coercion, fraud, and compromised accounts.

## Incident readiness

- Document severity levels, on-call ownership, containment, evidence preservation, notification assessment, recovery, and retrospective requirements.
- Run tabletop exercises before beta.
- Test account revocation, provider-key rotation, media access invalidation, and database restoration.

## Security acceptance evidence

- Approved threat model.
- Data-flow and trust-boundary diagrams.
- Access-control matrix and authorization tests.
- Dependency/container/IaC scan results.
- Penetration-test report and remediation record.
- Backup/restore evidence.
- Privacy workflow test evidence.
- Incident-response exercise record.
- Consent-withdrawal propagation and partner emergency-revocation exercise.
- Analytics/crash-report payload allowlist tests and deletion evidence.
