# Human Research Authorization Register

- **Owner:** Carl Welch
- **Approvers:** Project owner and privacy/trust reviewer
- **Status:** Controls not approved; operations closed
- **Last reviewed:** 2026-08-28
- **Next review:** Before any participant contact
- **Version:** 2.0
- **Controlling ticket:** ARG-030

## Decision boundary

Planning recruitment, drafting prompts, or identifying potential participants
does not authorize contact. Human research may begin only when
`research-authorization.json` validates with shared controls approved,
operational state `Open`, and the exact protocol/activity authorized. Approval
is pinned to artifact hashes, dated evidence, and review/expiry dates. Audio,
video, human transcription, automated transcription, quotes, follow-up, and
reuse are independent permissions.

CI resolves repository approval references and validates external Asana/GitHub
reference syntax. Before opening operations, the human reviewers must open and
verify each external reference; syntax validation alone is not approval proof.

This register does not authorize real applicant intake, production access,
matching, identity resolution, or provider processing.

## Required authority and approvals

The JSON authorization is the only mutable approval-state record. This table
defines requirements and deliberately does not duplicate current values.

| Control | Requirement before outreach |
| --- | --- |
| Research owner | Named owner accepts operational responsibility |
| Project owner | Named, dated, current approval evidence recorded |
| Privacy/trust reviewer | Named, dated, current approval evidence recorded |
| Participant system of record | Approved system reference and approval evidence recorded |
| Recruitment channels | Every allowed channel explicitly approved and protocol-bound |
| Data governance | Per-class system, roles, retention, deletion, and incident rules approved |
| Incentives | Protocol-specific decision and terms approved or explicitly not applicable |
| Operational state | Shared controls and exact protocol are current; state is Open |

## Research data inventory

| Data | Purpose | Location rule |
| --- | --- | --- |
| Recruitment and scheduling contacts | Contact and schedule consenting participants | Approved participant system; never this repository |
| Consent receipts | Prove purpose-specific permission and withdrawal instructions | Approved participant system; repository contains only the empty template |
| Redacted session notes | Synthesis and traceability | Repository with opaque references after redaction |
| Recordings and raw transcripts | Optional source evidence | Prohibited unless the exact activity, processor, system, and retention are approved |
| Incentive ledger and payment details | Track approved participant compensation | Approved financial/research system; never this repository |

Names, contact details, recordings, raw transcripts, payment data, identity
documents, and sensitive participant details must not be stored in this
repository. A selected system of record must define access, export, correction,
retention, deletion, backup, incident, and offboarding behavior before approval.

## Consent receipts and incentives

Use [research-consent-receipt.md](../templates/research-consent-receipt.md) only
as an empty schema. Store completed receipts in the approved participant system
of record. Each consent purpose is independent; a participant may approve notes
while declining quotes, recording, transcription, or follow-up.

No incentive amount, eligibility rule, payment mechanism, tax treatment, or
dispute process is approved. Incentives must not be coercive and must not depend
on completing every question. Approval must define whether a participant who
withdraws is still paid and who resolves payment problems.

## Withdrawal and deletion

The participant withdrawal channel, acknowledgement target, completion target,
identity-verification method, downstream deletion procedure, exception policy,
and escalation path are unapproved. Do not contact participants until these
controls are approved and included in the consent readout.

## Safety and incident handling

The safety owner and deputy are unassigned. Before outreach, the approved
procedure must cover participant distress, oversharing, threats, suspected
abuse, privacy incidents, researcher conflicts, session termination, evidence
minimization, escalation, and follow-up. Research is not legal, clinical,
relationship, or emergency advice.

The executable draft is
[research-control-procedures.md](research-control-procedures.md). Its exact
version and revision must be approved and pinned before use.

## Accessibility and communication

Participants must be offered an accessible communication path and an optional,
minimized way to request accommodations without being asked for a diagnosis.
The accommodation and communication procedures remain unapproved. A participant
must be able to decline an accommodation question without affecting eligibility
or incentives.

## Protocol register

| Ticket | Purpose | Approval | Allowed activities |
| --- | --- | --- | --- |
| ARG-002 | Service operations and matchmaker workflow | Not approved | None |
| ARG-003 | Candidate and client concept and language research | Not approved | None |
| ARG-031 | Buyer problem intensity, authority, and commitment | Not approved | None |

Additional protocols, including representative research supporting later
implementation tickets, must be added to both the backlog and the
machine-readable register before approval.

The governed-ticket registry also includes ARG-809 consenting usability beta
work. ARG-031 is now registered but remains unauthorized; neither ticket can
enter `Ready` or `In progress` until its concrete protocol has current outreach
authorization.

## Approval record

Do not maintain approval checkboxes here. The versioned JSON record carries the
system of record, channels, per-data-class rules, withdrawal targets, safety and
accessibility controls, protocol artifacts, exact activity permissions, dated
approval evidence, review/expiry dates, and operational state. The validator
rejects drift in the status-bearing register header and protocol table.

Until the machine record is complete and current, operational state remains
`Closed` and every protocol activity permission remains `false`.
