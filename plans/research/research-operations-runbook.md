# Research Operations Runbook

## Purpose

Provide a repeatable operating process for executing `ARG-002` and `ARG-003`
without collecting unnecessary sensitive data or letting research notes become
unreviewed product decisions.

## Scope

This runbook covers:

- participant screening;
- session scheduling;
- consent/readout language;
- note handling;
- synthesis;
- downstream decision updates.

It does not approve real applicant intake, payment collection, identity
verification, conversational/voice implementation, matching logic, or production
data handling.

## Research sequence

Run in this order:

1. Founder/operator workflow interview.
2. Practicing matchmaker/operator interviews.
3. Five workflow case walkthroughs.
4. Applicant/candidate concept reviews.
5. Potential paying-client concept reviews.
6. Founder/operator copy review.
7. Accessibility-oriented concept review.
8. Synthesis and downstream gate update.

`ARG-003` can run in parallel with `ARG-002`, but `ARG-005`, `ARG-012`, and
implementation planning should wait for both syntheses.

## Session naming

Use non-identifying IDs:

- `ARG002-FND-001`
- `ARG002-MM-001`
- `ARG002-CASE-001`
- `ARG003-APP-001`
- `ARG003-CLIENT-001`
- `ARG003-A11Y-001`

Do not use participant names in filenames, branch names, PR comments, commits,
or planning tables.

## Storage rules

Planning files may store:

- redacted observations;
- session IDs;
- role labels;
- explicit participant quotes only if consent permits short quotes;
- synthesis and downstream impacts.

Planning files must not store:

- real names;
- phone numbers, emails, addresses, workplace names, or social handles;
- intimate histories;
- financial account details;
- identity documents;
- health, safety, or background-check details;
- third-party identifying details;
- raw transcripts or recordings.

Raw recordings or transcripts require a separate approved storage location,
retention date, deletion process, and access list before use.

## Pre-session checklist

- [ ] Confirm participant segment and session ID.
- [ ] Confirm the session maps to `ARG-002`, `ARG-003`, or both.
- [ ] Send the plain-language purpose and consent/readout script.
- [ ] Confirm whether notes only or recording/transcription is allowed.
- [ ] Prepare only the relevant prompts from the protocol.
- [ ] Prepare a research note file from
  [research-session-notes.md](../templates/research-session-notes.md).
- [ ] Confirm no production credentials, private profiles, or real applicant
  records are used.

## During-session checklist

- [ ] Restate purpose and non-goals.
- [ ] Confirm consent scope.
- [ ] Avoid collecting unnecessary sensitive details.
- [ ] Ask for behaviors, decisions, examples, and interpretations.
- [ ] Mark ambiguous findings as assumptions, not facts.
- [ ] Ask what the participant believes happens next.
- [ ] Capture exact wording only when it materially affects language decisions
  and consent allows it.

## Post-session checklist

- [ ] Redact notes.
- [ ] Convert notes into observation rows.
- [ ] Tag downstream tickets.
- [ ] Record confidence and severity.
- [ ] Record whether a finding is evidence, inference, or open question.
- [ ] Remove or isolate raw sensitive material.
- [ ] Update synthesis tracker.

## Synthesis threshold

Research is sufficient for gate review when:

- every required segment has evidence or a documented approved fallback;
- findings are mapped to downstream tickets;
- high-severity language or trust risks have explicit mitigations;
- no unsupported success, safety, verification, payment-priority, or AI
  compatibility claims remain;
- the owner can decide what moves forward, what needs revision, and what stays
  blocked.

## Handoff outputs

At synthesis, update:

- `plans/research/research-synthesis-tracker.md`;
- affected ticket files;
- `plans/experience.md` if workflows change;
- `plans/product.md` if positioning or promise language changes;
- `plans/risks.md` if a new risk or changed severity is discovered;
- `plans/decisions.md` if a material decision is approved.
