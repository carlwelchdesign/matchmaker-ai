# Optional Conversational Intake Research Plan

## Status and intent

This is a research and prototype brief for `ARG-027` and `ARG-028`. It does not approve production recording, speech processing, or automatic profile updates.

The market, experience, data, rollout, and AI-cost findings are maintained in [adaptive-candidate-interviewing.md](research/adaptive-candidate-interviewing.md). That research recommends a constrained, text-first adaptive interview before any voice beta.

Argent should test conversation as an **optional way to complete an application**, alongside a traditional structured path and a hybrid path. It may reduce writing burden and help people express nuance. It must not become an opaque personality assessment, a simulated therapist, or the only accessible route to apply.

## Experience principles

- Let the applicant choose typing, speaking, or a hybrid and switch at any time.
- Identify the interviewer plainly as AI; do not imply a human is listening live.
- Explain recording, transcription, AI processing, visibility, retention, and deletion before capture.
- Ask standardized, purpose-bound questions so applications remain comparable.
- Use push-to-talk or explicit record/stop controls; never passively listen.
- Show a live or near-live transcript that can be edited or deleted.
- Produce proposed structured fields with the source passage attached.
- Require approval of each proposed field before it becomes profile data.
- Preserve `unknown`, “prefer not to answer,” pause, save, and resume.
- Let the applicant preview the same final application a form user would see.
- Provide a clear text-only path, human assistance path, and withdrawal path.

The voice and language should be calm, direct, discreet, and curious. It should not flatter wealth, reward grandiosity, diagnose, challenge, manipulate, or encourage escalating disclosure.

## Proposed flow

1. Choose `structured`, `conversation`, or `hybrid`.
2. Review a plain-language consent screen for the selected mode.
3. Answer one bounded question by text or voice.
4. Review, correct, or delete the transcript.
5. Review proposed facts beside the exact supporting passage.
6. Approve, edit, reject, or mark each fact private.
7. Continue until required structured fields are complete.
8. Review the full application, notices, and visibility before submission.
9. Retain or delete source material according to the explicit choice and approved policy.

Conversation adds elaboration around a structured core; it does not remove required, comparable fields such as intent, geography, availability, boundaries, and consent.

## Data boundary

```text
explicit recording
  -> speech-to-text draft
  -> applicant transcript correction
  -> sensitive-data and oversharing review
  -> source-grounded structured proposals
  -> applicant field-by-field approval
  -> versioned application answers / profile assertions
```

- Raw audio is a separate, more restricted artifact and is ephemeral by default.
- Keeping audio requires a distinct purpose, explicit consent, and short retention.
- A transcript remains a sensitive source artifact even after audio is deleted.
- Rejected or unapproved content does not enter the profile, retrieval index, analytics, or model-training corpus.
- Approved fields preserve provenance to the approved transcript revision without exposing unrelated passages.
- No voiceprint, emotion detection, accent classification, deception detection, or psychological inference is permitted.
- Provider training is disabled contractually; inputs are minimized and authorization is checked at execution time.

## Open speech-to-text feasibility

“Free” means an open license, not zero operating cost. On-device inference can reduce data transfer but introduces model-size, battery, device, language, and accuracy constraints. Self-hosting still has compute and operations costs.

| Candidate | Relevant characteristics | License | Research questions |
| --- | --- | --- | --- |
| OpenAI Whisper | Multilingual general-purpose speech recognition; downloadable models | MIT | Accuracy by language/accent, server cost, retention boundary, mobile practicality |
| whisper.cpp | Local Whisper inference with iOS, Android, WebAssembly, and offline examples | MIT | Device coverage, model size, latency, battery, Flutter integration |
| Vosk | Offline streaming speech recognition with mobile and server support | Apache-2.0 | Language quality, model availability, punctuation, maintenance |
| sherpa-onnx | Offline and streaming speech support with iOS, Android, and Flutter examples | Apache-2.0 | Flutter maturity, model provenance/licenses, device performance, accessibility |

No stack is selected. `ARG-028` must test real target devices, representative voices, noisy environments, and the approved language set before an ADR.

## Privacy, legal, and safety questions

- California confidential-communication recording generally requires consent of all parties; counsel must define the exact notice and jurisdiction rules.
- A bystander's speech must not be captured without an approved handling path.
- Recording, transcription, structuring, source retention, and research reuse are separate purposes and choices.
- Applicants need deletion, correction, revocation, and data-export behavior that includes source artifacts and derived fields.
- Highly personal relationship, sexual, health, religious, identity, and location information requires field-level purpose and visibility rules.
- The interface should warn users not to share account credentials, government identifiers, financial account information, third-party secrets, or information about another person.
- A text or human-assisted alternative must remain available without penalizing admission.
- The system must define what happens when speech recognition is uncertain, unavailable, or materially wrong.

## Accessibility and inclusion

- keyboard-complete typed alternative and visible captions;
- pause, replay, skip, save, resume, and no artificial time pressure;
- screen-reader labels and non-audio instructions;
- support for speech disabilities and assisted completion;
- correction tools that do not require re-recording;
- accuracy and abandonment evaluation by language, accent, device, and environment;
- no inference from accent, dialect, fluency, tone, cadence, or voice.

## Prototype sequence

1. Test a faceless text conversation and ordinary dictation with no anthropomorphic avatar.
2. Compare structured, conversation, and hybrid completion using the same required fields.
3. Use a Wizard-of-Oz or local prototype with synthetic data; do not retain production recordings.
4. Test source-grounded field extraction and field-by-field approval.
5. Conduct privacy, accessibility, and oversharing reviews.
6. Run ASR feasibility on target devices and languages.
7. Approve a recording/retention/provider ADR before production engineering.

## Evaluation

- completion, abandonment, time, and resume rate by mode;
- applicant comfort, trust, understanding, and sense of control;
- transcript correction rate and word-error rate by tested cohort;
- structured-field accuracy, source-support rate, and applicant rejection/edit rate;
- sensitive oversharing and third-party disclosure rate;
- accessibility failures and mode-switching behavior;
- matchmaker usefulness without revealing unapproved source text;
- processing latency, device impact, compute cost, and deletion reliability.

Success is not “users disclose more.” Success is useful, intentional, accurately represented information with less burden and preserved control.

## Assumption policy

The idea that affluent male applicants are likely to be narcissists is a research hypothesis at most, not a product persona or design premise. Some research reports group-level associations between social class and entitlement, but that cannot diagnose an individual or justify gender/class-based treatment. Argent should test neutral questions about self-presentation, expectations, boundaries, respect, and concierge preferences across relevant users.

No prompt, score, model feature, agent persona, staff script, or service tier may label or treat a demographic group as narcissistic.

## Gate checklist

- [ ] Applicant research supports a conversational or hybrid option.
- [ ] Standardized question set and structured-field mapping approved.
- [ ] Recording/transcription notices and consent reviewed by counsel.
- [ ] Audio, transcript, derived-field, and deletion policies approved separately.
- [ ] ASR feasibility and subgroup/accessibility results meet thresholds.
- [ ] Source-grounded extraction reaches its accuracy and zero-tolerance thresholds.
- [ ] Oversharing, third-party data, prompt-injection, and prohibited-inference tests pass.
- [ ] Text-only and human-assisted alternatives verified.
- [ ] Provider/on-device decision documented in an ADR.
- [ ] `candidate-interviewing` is wired server-side with off/fallback/rollback tests; the Vercel flag alone is not a launch gate.
- [ ] Per-session model, token, audio-minute, latency, retry, and estimated-cost metering is verified.

## References

- Chatbot self-disclosure study: <https://pubmed.ncbi.nlm.nih.gov/30100620/>
- Faceless computer-assisted interviewing study: <https://www.sciencedirect.com/science/article/abs/pii/S0747563219304170>
- Human likeness and sensitive disclosure randomized study: <https://www.sciencedirect.com/science/article/pii/S074756322500130X>
- Conversational AI and disclosure review: <https://link.springer.com/article/10.1007/s00779-024-01823-7>
- California Penal Code section 632: <https://www.leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632.>
- California Privacy Protection Agency FAQ: <https://cppa.ca.gov/faq>
- OpenAI Whisper: <https://github.com/openai/whisper>
- whisper.cpp: <https://github.com/ggml-org/whisper.cpp>
- Vosk: <https://github.com/alphacep/vosk-api>
- sherpa-onnx: <https://github.com/k2-fsa/sherpa-onnx>
- Piff, 2014, social class and entitlement/narcissism: <https://pubmed.ncbi.nlm.nih.gov/23963971/>
