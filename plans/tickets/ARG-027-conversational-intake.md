# ARG-027 — Optional conversational-intake research

- **Epic:** Conversational intake
- **Capability/requirement IDs:** CAP-001, CAP-004, CAP-005, CAP-010
- **Priority:** P0
- **Status:** In progress
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned product, privacy, accessibility, and AI reviewers
- **Target milestone:** Decision gate
- **Estimate band:** M
- **Dependencies:** ARG-003, ARG-006, ARG-018, ARG-026
- **Decision/risk links:** DEC-013, DEC-014, ADR-020, R-039, R-040
- **Blocked reason/review date:** Real-person testing awaits research protocol, counsel review, and approved source-data handling

## Outcome

Applicants can be evaluated for a lower-burden conversational or hybrid path that preserves comparability, accessibility, accuracy, consent, and control.

## Scope

- Structured, text-conversation, voice, and hybrid concept comparison.
- Standardized question and source-to-field mapping.
- Transcript correction and field-by-field approval.
- Recording, transcript, derived-field, deletion, and visibility boundaries.
- Oversharing, accessibility, accuracy, and trust evaluation.
- Open-source speech feasibility handoff to ARG-028.

## Non-goals

- Production voice capture or speech provider integration.
- Passive listening, human-like avatar, therapy simulation, emotion/voice analysis, or diagnosis.
- Treating greater disclosure as success.
- Replacing the structured core or human-assisted option.

## Acceptance criteria

- [x] Initial experience, data boundary, safety rules, feasibility candidates, metrics, and gates documented in [conversational-intake.md](../conversational-intake.md).
- [x] The wealthy-male/narcissism assumption is explicitly excluded from persona and model behavior.
- [x] Transcript correction precedes structuring and each proposed field requires applicant approval.
- [ ] Low-fidelity structured, conversational, and hybrid concepts are tested with an approved research cohort.
- [ ] Standardized questions and source-to-field mappings are approved.
- [ ] Privacy, legal, accessibility, oversharing, and prohibited-inference reviews pass.
- [ ] ARG-028 defines a viable ASR option or voice remains deferred.

## Security, privacy, AI, data, and accessibility

- Data classes: SENSITIVE audio, transcript, relationship preferences, and derived proposals.
- Data-flow changes: None in this research ticket; proposed flow is documented only.
- Roles/permissions: Applicant controls source and field approval; staff sees approved fields by default.
- Consent/retention: Recording, transcription, structuring, source retention, and research reuse are separate.
- Deletion/revocation effects: Must cover audio, transcript, proposals, profile assertions, indexes, artifacts, and providers.
- Threats/abuse: Oversharing, bystander data, prompt injection, transcription error, manipulation, and stereotype bias.
- AI level and review: Draft only until applicant approval.
- Accessibility: Equivalent typed and human-assisted paths, captions, correction, no time pressure.
- Logging/redaction: No raw audio, transcript, or proposed field values in telemetry.

## Research checklist

- [x] Define optional mode choice and applicant-control principles.
- [x] Define the source-grounded extraction boundary.
- [x] Identify open speech-recognition candidates without selecting one.
- [x] Define privacy, accessibility, inclusion, and evaluation questions.
- [ ] Prototype structured, conversational, and hybrid concepts.
- [ ] Conduct approved user research and accessibility review.
- [ ] Complete counsel-reviewed recording and data-purpose requirements.
- [ ] Hand target-device ASR protocol to ARG-028.

## Verification evidence

- [x] Planning review: `plans/conversational-intake.md`
- [ ] User research:
- [ ] Privacy/legal review:
- [ ] Accessibility review:
- [ ] Speech feasibility:

## Delivery evidence

- Branch: `planning/foundation`
- Commit:
- PR: <https://github.com/carlwelchdesign/matchmaker-ai/pull/1>
- Merge: Pending
- Deployment: Not applicable
- Evidence paths: `plans/conversational-intake.md`
- Completion date: Pending

## Completion notes

The recommended first prototype is faceless text conversation plus ordinary dictation, not an anthropomorphic voice avatar. Production implementation remains blocked.

- Follow-up owner: ARG-025 assignment required

