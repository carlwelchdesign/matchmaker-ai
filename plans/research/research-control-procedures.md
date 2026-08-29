# Human Research Control Procedures

- **Owner:** Carl Welch
- **Approvers:** Project owner and privacy/trust reviewer
- **Status:** Draft — no outreach authorized
- **Version:** 1.0
- **Effective date:** Not approved
- **Last reviewed:** 2026-08-28
- **Next review:** Before any participant contact
- **Controlling ticket:** ARG-030

This procedure is an approval candidate, not an authorization. The exact file
revision must be pinned by `research-authorization.json` and approved before
participant contact.

## Participant system and data controls

The approved participant system of record must hold contact/scheduling records,
completed consent receipts, incentive records, and any separately approved raw
recording or transcript. The repository may hold only opaque references,
redacted notes, and synthesis.

Before approval, record for every data class:

- purpose and minimum fields;
- collection source and approved system;
- allowed roles and access-review owner;
- correction/export method;
- maximum retention and deletion trigger;
- backup/deletion behavior;
- incident owner and notification path;
- vendor/offboarding export and deletion behavior.

Access is least privilege. Never place direct participant identifiers, contact
details, payment data, recordings, raw transcripts, identity documents, or
unnecessary sensitive details in the repository, commit history, tickets, or PR
discussion.

## Incentives

Each protocol must declare either an approved incentive policy or a reviewed
`Not applicable` decision. An approved policy specifies amount/value,
eligibility, delivery mechanism, owner, tax/accounting handling, timing,
withdrawal/partial-session treatment, dispute path, and evidence location.
Payment must not depend on answering every question or completing a session
after a participant chooses to stop.

## Withdrawal, correction, and deletion

The approved readout provides separate acknowledgement and completion targets.
The researcher records an opaque request reference, confirms identity using the
approved system, stops future contact and unapproved processing, and routes the
request to the data owner. The disposition must state what was corrected or
deleted, what approved exception applies, and how already de-identified or
aggregated synthesis is treated. Missed targets escalate to the privacy/trust
reviewer.

## Accessibility and communication

Offer an optional way to request format, communication, scheduling, or
interaction adjustments without asking for a diagnosis. Store only the action
needed. A declined accommodation question cannot affect inclusion or incentives.
Research segmentation by disability-related information requires a separately
approved purpose and minimized data plan.

## Safety and session termination

Before each session, confirm the safety owner or deputy is reachable through the
approved channel.

- Stop recording immediately when consent is withdrawn, scope is unclear, or an
  unapproved person joins.
- Redirect oversharing and do not copy unnecessary sensitive material.
- Pause or end the session for distress, threats, suspected abuse, privacy
  incidents, researcher conflict, or any situation outside the protocol.
- Do not represent Argent research as emergency, legal, clinical, relationship,
  verification, or safety advice.
- For immediate danger, direct the participant to local emergency services. Do
  not promise monitoring or response that is not approved and staffed.
- Minimize incident evidence, use opaque references, notify the safety owner or
  deputy, and notify the privacy/trust reviewer for personal-data exposure.
- Do not resume processing or contact until an authorized owner records the
  disposition, participant communication, containment, and follow-up.

## Incident handling

Contain first: stop the session/processing, restrict access, preserve only the
minimum evidence, and avoid copying sensitive content into chat or tickets. The
incident owner classifies affected data, systems, participants, permissions, and
vendors; records decisions and timestamps; performs required communication; and
tracks correction/deletion and preventive action. Provider or production
incident handling remains outside this draft until those systems are selected
and approved.
