# ARG-002/ARG-003 Field Research Execution Packet

## Purpose

Turn the approved research protocols into a small, privacy-conscious field
study that produces decision-grade evidence before Argent implements lifecycle,
application, campaign, matching, or conversational-intake behavior.

This packet supports preparation and scheduling only. Public recruiting,
participant incentives, recording, use of production data, and a change to
either research ticket's `Ready` status require their own appropriate approval.

## Evidence target

Complete the following sessions using the existing protocols and moderator
guides:

| Track | Sessions | Minimum | Evidence needed for |
| --- | --- | ---: | --- |
| Founder/operator workflow | `ARG002-FND-001` | 1 | ARG-002 and ARG-003 |
| Matchmaker/high-touch workflow | `ARG002-MM-001..002` | 2 | ARG-002 |
| Case walkthrough | `ARG002-CASE-001..005` | 5 | ARG-002; five synthetic rehearsals already exist, but do not replace operator evidence |
| Applicant/candidate concept review | `ARG003-APP-001..003` | 3 | ARG-003 |
| Potential paying-client concept review | `ARG003-CLIENT-001..002` | 2 | ARG-003 |
| Founder/operator copy review | `ARG003-FND-001` | 1 | ARG-003; may be combined with the founder workflow session only if both guides are run |
| Accessibility-oriented review | `ARG003-A11Y-001` | 1 | ARG-003 |

The smallest practical study is nine people: one founder/operator, two
matchmaker or high-touch operators, three applicant/candidate representatives,
two potential paying-client representatives, and one accessibility-oriented
reviewer. One person may participate in more than one compatible track only
when the session record clearly separates the protocol, evidence, and consent.
Avoid using the founder to fill applicant/client/accessibility evidence gaps.

## Owner actions before any invitation

1. Name the project owner/researcher and confirm the private communication and
   note-storage location outside this repository.
2. Set a provisional target week and book no more than two sessions before
   checking early notes for confusing prompts or privacy issues.
3. Decide whether incentives will be offered. If yes, get business/legal and
   tax approval, keep payment details outside the repository, and state that
   compensation is not tied to a positive answer or product admission.
4. Use the [participant screener](participant-screener.md) only to determine
   fit. Keep names, email addresses, scheduling details, and screener responses
   in a restricted contact log outside Git.
5. Send the appropriate invitation below. Do not describe the recipient as
   qualified, elite, verified, admitted, or likely to receive service.

## Private recruitment tracker

Maintain this table only in an approved restricted workspace, never in Git,
planning files, analytics, or model prompts.

| Internal contact reference | Segment | Invitation sent | Screener outcome | Session ID | Notes consent | Recording consent | Follow-up consent | Retention/delete date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `CONTACT-001` | | | | | | | | |

Use an internal contact reference that cannot identify a person without access
to the restricted contact log. Copy only the session ID and redacted findings
into the repository.

## Invitation copy

### Founder or matchmaker/operator

> We are conducting early, private research for Argent Matchmaking to
> understand how a high-touch matchmaking service should operate. This is a
> 60-minute workflow conversation, not a product demo or an evaluation of you
> or your clients. We will ask about general patterns, decisions, and what must
> remain human-led. Please do not share names, identifying details, intimate
> histories, or client records. We will take redacted notes only unless you
> separately agree to recording or transcription. Would you be open to taking
> part?

### Applicant/candidate or potential client representative

> We are testing early language for a private, human-led matchmaking service.
> This is a 60-minute concept review, not an application, eligibility screen,
> matchmaking interview, or offer of service. We will show low-fidelity copy
> and ask what you believe it means. Please do not share private relationship,
> financial, identity, or health information. We will take redacted notes only
> unless you separately agree to recording or transcription. Would you be open
> to taking part?

### Accessibility-oriented reviewer

> We are testing early copy and intake choices for a private, human-led
> matchmaking service. This is a 60-minute accessibility and clarity review,
> not an application or eligibility evaluation. We would value your perspective
> on reading burden, status language, alternate input needs, and privacy. You
> do not need to disclose any diagnosis or personal information. We will take
> redacted notes only unless you separately agree to recording or transcription.
> Would you be open to taking part?

## Session operating card

Use this for every scheduled session:

- Session ID: use the naming convention in the
  [research operations runbook](research-operations-runbook.md).
- Protocol: select `ARG-002`, `ARG-003`, or both.
- Materials: open only the relevant moderator guide and, for `ARG-003`, the
  low-fidelity concept stimuli.
- Length: 60 minutes; stop at 45 minutes if consent, privacy, or participant
  comfort needs more time.
- Note method: use a local copy of the
  [research session notes template](../templates/research-session-notes.md),
  then redact before any planning update.
- Recording: off by default. Turn on only after explicit separate consent and
  approved storage/retention/access controls exist.
- Stop rule: pause or end immediately if the discussion turns into a real
  application, personal crisis, safety disclosure, intimate history, identity
  verification, or other sensitive disclosure. Acknowledge, do not investigate,
  and remove the detail from research notes.
- Closeout: read the closeout script, confirm whether follow-up is permitted,
  and record only that permission state.

## Evidence quality and synthesis

After every two sessions, update the private working synthesis. After all
minimum sessions, create a redacted evidence update in
[research-synthesis-tracker.md](research-synthesis-tracker.md):

1. Record the session-count change and a non-identifying source session ID.
2. Add only observations that distinguish evidence, inference, and open
   question.
3. Classify the effect as approved language, needs revision, policy escalation,
   prohibited, must support in MVP, manual fallback, later optimization, or do
   not build.
4. Map every material finding to a downstream ticket and name the owner who
   must decide it.
5. Escalate before synthesis if the finding suggests discrimination, an
   unsupported verification/safety claim, pay-to-play treatment, privacy harm,
   or AI prediction/ranking.

Do not claim consensus from a small qualitative study. The output is a
decision record with explicit limitations, not proof of market demand or
relationship outcomes.

## Gate review meeting

Book a 45-minute owner review only after the session coverage table is updated.
The review agenda is:

1. Confirm coverage, limitations, and any approved fallbacks.
2. Review the five highest-severity findings first.
3. Decide which language is approved, revised, escalated, or prohibited.
4. Decide what remains manual in the pilot versus what must be designed before
   implementation.
5. Update `plans/decisions.md`, `plans/risks.md`, downstream tickets, and the
   go/no-go checklists.

ARG-002 and ARG-003 may move to `Done` only through a separate evidence and
decision PR after that review; this packet does not close either gate.
