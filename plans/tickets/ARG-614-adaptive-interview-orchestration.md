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

- [ ] Required topics, approved optional probes, sensitive-topic boundaries, stop conditions, and source-to-field mappings are versioned.
- [ ] Every proposed question stores guide, prompt, model, source references, reason code, and disposition.
- [ ] Candidate-approved facts, explicit unknowns, contradictions, and uncovered required topics are the only permitted planning inputs.
- [x] Compound questions, repetitive acknowledgement, premature termination, unsupported inference, and topic drift have evaluation thresholds.
- [ ] Human handoff, skip, clarification, and structured-form fallback are deterministic.
- [ ] No protected-trait, emotion, accent, deception, attractiveness, wealth, diagnosis, or compatibility inference is produced.
- [ ] No admission, rejection, ranking, matching, or profile mutation occurs without the existing human/applicant approvals.

See [adaptive-candidate-interviewing.md](../research/adaptive-candidate-interviewing.md).

## Foundation evidence

- Foundation branch: `codex/ARG-613-text-interview`
- Foundation commit: `5f17f5b`
- Candidate-assistance branch: `codex/ARG-614-interview-assistance`
- Candidate-assistance commit: `facb39b`
- The local ARG-613 prototype now uses `argent-template-planner-2026-08-25`
  with the versioned `argent-text-guide-2026-08-25` core.
- Each local question plan records the guide and planner versions, explicit
  `model: null`, a reason code, and exact question/revision source references.
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
- The local human-assistance explanation is deliberately non-operative: it
  states that no person was contacted and no answers were sent, while defining
  the permission and context-preview boundary a future handoff must meet.
- This does not complete a real human handoff, the provider-backed planner,
  stored question disposition, or approval-gated policy work. Those acceptance
  criteria remain open until their dependencies are approved.
