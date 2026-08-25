# ARG-614 — Adaptive interview guide and question orchestration

- **Epic:** Governed AI assistance
- **Capability/requirement IDs:** CAP-005, CAP-010
- **Priority:** P1
- **Status:** In progress
- **Named owner:** Unassigned
- **Named approver/reviewer:** Unassigned product, AI, privacy, and research reviewers
- **Target milestone:** Private beta
- **Estimate band:** L
- **Dependencies:** ARG-020, ARG-027, ARG-604, ARG-607, ARG-608, ARG-611
- **Decision/risk links:** DEC-008, DEC-013, DEC-014, DEC-020, R-003, R-039, R-040, R-043

## Outcome

A versioned guide and constrained planner generate relevant, one-at-a-time follow-ups without inventing purposes, making consequential decisions, or hiding why a question was asked.

## Acceptance criteria

- [x] Required topics, approved optional probes, sensitive-topic boundaries, stop conditions, and source-to-field mappings are versioned.
- [x] Every proposed question stores guide, prompt, model, source references, reason code, and disposition.
- [x] Candidate-approved facts, explicit unknowns, contradictions, and uncovered required topics are the only permitted planning inputs.
- [x] Compound questions, repetitive acknowledgement, premature termination, unsupported inference, and topic drift have evaluation thresholds.
- [ ] Human handoff, skip, clarification, and structured-form fallback are deterministic.
- [x] No protected-trait, emotion, accent, deception, attractiveness, wealth, diagnosis, or compatibility inference is produced.
- [x] No admission, rejection, ranking, matching, or profile mutation occurs without the existing human/applicant approvals.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).

## Foundation evidence

- Foundation branch: `codex/ARG-613-text-interview`
- Foundation commit: `5f17f5b`
- Candidate-assistance branch: `codex/ARG-614-interview-assistance`
- Candidate-assistance commit: `facb39b`
- The local ARG-613 prototype now uses `argent-template-planner-2026-08-25`
  with the versioned `argent-text-guide-2026-08-25` core.
- The exported guide contract now binds that version to its required question
  IDs, ten controlled optional probes, stable sensitive-boundary and stop codes,
  and exact question-to-field/topic mappings.
- Each local question plan records the guide and planner versions, explicit
  `model: null`, a reason code, and exact question/revision source references.
- The adaptive interview now snapshots each proposed question into a local
  lifecycle record with the complete planner payload and an explicit proposed,
  answered, declined, or superseded disposition.
- Editing an earlier answer supersedes its downstream question history, clears
  downstream field approvals, and replans from prior answers only; stale source
  grounding cannot silently survive a revision.
- Planner input is now a closed discriminated union of candidate-confirmed
  facts, explicit unknowns, documented contradictions, and uncovered required
  topics. The current deterministic builder emits only prior confirmed/declined
  responses plus the current uncovered topic; later answers are excluded.
- Candidate confirmation for question planning is stored separately from the
  later field-level decision about profile use, and the interface explains that
  boundary before the candidate continues.
- Adaptive prompts may use only a closed, approved vocabulary for pace, life
  rhythm, and introduction-boundary follow-ups; arbitrary candidate text is
  never interpolated into a prompt.
- Declined answers and unsupported or prompt-injection-like text fall back to
  the required core question without source references.
- The candidate sees a plain-language “Why this question” explanation.
- `interview-plan-evaluation.ts` applies explicit zero-tolerance thresholds for
  compound questions, repeated acknowledgement language, premature completion,
  unsupported source grounding, and guide/topic drift.
- Evaluation fixtures include one guide-aligned passing run and isolated failing
  runs for every threshold, including an exact source-revision mismatch and a
  reason code that claims support for the wrong topic.
- Structured, conversation, and hybrid modes now expose one deterministic help
  control for clarification, privacy boundaries, approach switching, and
  continuing without an interview.
- A tested assistance state machine now governs help open/close, clarification,
  privacy guidance, human-request preview/staging, and return-to-interview
  transitions instead of leaving those outcomes implicit in UI branches.
- Conversation and hybrid modes offer a direct structured-question fallback.
  The local human-help preview names the minimal context that would be shared,
  excludes drafts and prior answers, and requires preview before local staging.
- The local human-assistance explanation is deliberately non-operative: it
  states that no person was contacted and no answers were sent, while defining
  the permission and context-preview boundary a future handoff must meet.
- Candidate-facing structured and adaptive flows now consume policy-compliant
  planner and field-proposal wrappers. Runtime output is rejected unless its
  shape, guide/planner versions, exact approved prompt and purpose, reason code,
  explanation, provenance shape, and source-to-field mapping match the
  versioned contract.
- The output policy rejects extra decision fields such as ranking, compatibility
  scoring, or admission state. Candidate field proposals are accepted only on
  an approved mapping when the proposed value is exactly the trimmed candidate
  source text; inferred profile mutation is rejected.
- Policy tests cover all four required questions, all ten approved optional
  probes, an unapproved wealth/admission prompt, hidden ranking and compatibility
  fields, exact-source proposals, inferred values, and extra admission fields.
- Human assistance now has a versioned, runtime-validated local request
  contract. It can carry only the request kind and either the approved current
  question mapping or a source-free structured-guide marker; draft responses,
  prior answers, and proposed profile fields are explicitly excluded.
- Local staging records `contactedHuman: false` and
  `sentCandidateContent: false`. Tests reject extra content and mismatched topic
  mappings, and the Sunrise interface displays the local-only contract state
  after the candidate reviews the request.
- This does not complete a real human handoff, the provider-backed planner, or
  approval-gated policy work. Those acceptance criteria remain open until their
  dependencies are approved.
