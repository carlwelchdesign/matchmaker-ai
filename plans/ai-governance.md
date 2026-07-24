# AI Governance and Evaluation Plan

## Role of AI

AI is a matchmaker assistant. It may draft, summarize, retrieve, compare, and suggest. It does not own admission, verification, match approval, introduction, safety, or privacy decisions.

Initial AI features are bounded model calls or deterministic workflows—not open-ended agents with arbitrary database, network, or messaging tools.

## Allowed initial use cases

- Draft a structured application summary from approved fields.
- Transcribe an explicitly initiated intake response and propose source-grounded fields after the applicant reviews the transcript.
- Identify missing, stale, or contradictory information.
- Suggest interview questions with source references.
- Retrieve candidate profiles matching explicit criteria.
- Suggest possible matches with evidence and uncertainty.
- Draft internal notes or communications for human review.
- Help classify operational work when the classification is reversible and reviewed.

## Prohibited or gated uses

- Automatic admission, decline, suspension, or removal.
- Automatic introduction or external message.
- Universal attractiveness scoring or treating appearance as objective truth.
- Inferring race, ethnicity, religion, disability, sexual orientation, health, personality disorder, emotional maturity, honesty, or socioeconomic status from appearance.
- Face recognition or biometric identification without a separately approved, lawful use case.
- Hidden ranking based on ability to pay or partner pressure.
- Compatibility percentages or predictions of attraction, date success, or relationship success.
- Inferred personality type, narcissism, attachment style, honesty, intent, or character.
- Ranking or interview behavior based on class, gender, occupation, accent, dialect, fluency, voice, or another demographic proxy.
- Adding unapproved transcript content or raw audio to a profile, retrieval index, analytics event, or training corpus.
- Emotion recognition, voice biometrics, deception detection, or psychological inference from speech.
- Training provider models on private Argent data without explicit contractual and governance approval.
- Sending safety, screening, legal, or highly restricted notes to a general model.

## Automation levels

| Level | Meaning | Initial policy |
| --- | --- | --- |
| Manual | No AI involvement | Always available |
| Draft | AI creates editable content | Allowed with provenance |
| Recommendation | AI suggests an option | Allowed with evidence and review |
| Assisted action | User approves a prepared action | Allowed for low/reversible risk after evaluation |
| Autonomous | AI acts without per-action review | Not allowed for consequential workflows |

## Required artifact metadata

Every AI artifact records:

- use case and policy version;
- model/provider and model version;
- prompt/template version;
- source record versions and permitted data classes;
- structured output schema version;
- created time, latency, and cost;
- confidence only when calibrated and meaningful;
- reviewer, edits, disposition, and override reason;
- safety filter or validation results;
- correlation and audit identifiers.

## Retrieval and recommendations

- Hard constraints are deterministic policy/data filters.
- Soft preferences may influence retrieval but must be visible.
- Vector similarity is a candidate-generation aid, never a final decision.
- Recommendation explanations cite the actual profile fields or matchmaker evidence used.
- Missing data lowers completeness; it is not treated as a negative trait.
- Protected or prohibited attributes must not enter ranking features.
- Structured facts and user-approved narrative fields remain distinct from inferred traits.
- Semantic embeddings may index only purpose-approved, allowlisted, user-approved text.
- The system presents evidence, conflicts, unknowns, and freshness—not a universal compatibility score.

The matching evidence and validation gate is [match-science.md](match-science.md).

## Conversational intake

- The applicant chooses structured, conversational, or hybrid entry and can switch modes.
- Recording is explicit, bounded to one response, and separately consented from transcription and retention.
- The applicant corrects or deletes the transcript before field extraction.
- Every proposed field includes the supporting passage and requires explicit approval.
- Rejected content is not retained for retrieval, analytics, or model improvement.
- Raw audio and transcript are separate restricted artifacts with independently approved retention.
- A text-only and human-assisted path remains available.
- The agent identifies itself as AI and does not simulate therapy, manipulate disclosure, or flatter status.

Production speech processing remains blocked by [conversational-intake.md](conversational-intake.md), the privacy assessment, ASR feasibility testing, and an approved provider/on-device ADR.

## Evaluation program

Create representative, synthetic, consented, and adversarial fixtures covering:

- accurate summary and field attribution;
- missing and conflicting information;
- unsupported claims;
- prompt injection in application text and documents;
- prohibited sensitive inference;
- discriminatory proxies and subgroup performance;
- inappropriate appearance-based judgment;
- overconfident relationship predictions;
- privacy leakage across people or campaigns;
- stale profile and consent state;
- malformed or partial provider output;
- model/provider outage and timeout.

Each use case requires:

- task-specific quality rubric;
- safety and privacy zero-tolerance cases;
- reviewer agreement process;
- launch threshold;
- regression suite;
- production sampling and incident pathway;
- cost and latency budget.

The fixture set, rubric, prohibited-use tests, and launch threshold for a use case must be approved before that feature is released and should precede substantial feature implementation.

## Human control

- Show source evidence and AI status.
- Make generated content editable.
- Preserve original source and human final version.
- Provide regenerate, dismiss, override, and report-problem actions.
- Log overrides without shaming the reviewer.
- Never make an AI warning a hard block unless deterministic policy requires it.

## Provider controls

- Contractual review of training, retention, region, subprocessors, abuse monitoring, and deletion.
- Data minimization and purpose-specific prompts.
- Separate configurations for ordinary and sensitive workflows.
- Timeouts, retries, budget limits, circuit breakers, and fallback behavior.
- Provider abstraction at an operational boundary, not speculative abstraction throughout the domain.

## AI use-case contract

Every AI ticket must define:

- user and operational outcome;
- automation level;
- allowed input fields and data classifications;
- authorization and consent filtering performed before invocation;
- allowed tools and explicitly forbidden actions;
- deterministic policy gates outside the model;
- structured output and evidence schema;
- unsupported-claim and partial-failure behavior;
- reviewer role and approval/override path;
- prompt-injection and data-exfiltration controls;
- latency, token, and cost budget;
- audit events and safe telemetry;
- fixture set, rubric, zero-tolerance cases, and launch threshold;
- rollback, quarantine, reprocessing, and incident traceability.

AI output is an immutable proposal linked to source versions or approved hashes. The accepted human version is stored separately.

## Production quality operations

- Sample completed artifacts for human review by use case and version.
- Track quality, override, policy-violation, privacy, latency, and cost trends.
- Detect model/provider drift and require controlled rollout of material version changes.
- Quarantine unsafe artifacts and identify every downstream recommendation they affected.
- Disable a model/prompt version without disabling unrelated workflows.
- Treat match and date outcomes as selection-biased operational evidence—not unbiased compatibility labels or automatic training targets.
