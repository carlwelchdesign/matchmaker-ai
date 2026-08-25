# Adaptive Candidate Interviewing and Candidate Intelligence Research

## Status and recommendation

This research narrows `ARG-027`, `ARG-613`, and the follow-on candidate-data work. It does not approve production interviewing, recording, automated admission, or automated matching.

Argent should build a **candidate-controlled adaptive interview**, not a chatbot-shaped form. A person chooses structured form, typed conversation, voice conversation, or a hybrid; may change modes without losing progress; reviews the source transcript; and approves each proposed fact before it becomes matchmaker-visible data. The interview should feel attentive and organic while remaining bounded by a versioned research guide and a comparable structured core.

The initial production slice should be text-first. Voice follows only after recording consent, transcription accuracy, accessibility, retention, deletion, and provider gates pass.

## Evidence-bounded differentiation

The premium matchmaking services reviewed publicly emphasize human consultation, proprietary screening, discretion, curated selection, and post-date feedback:

- Tawkify describes video interviews, matchmaker-led learning, screening, dates, and feedback.
- Selective Search describes a six-step process and a structured set of benchmarks and indicators followed by personal interviews.
- Kelleher International describes application, consultation, an onboarding interview, curated matching, and facilitated introduction.
- It's Just Lunch emphasizes a private interview, human matching, and feedback rather than public profiles.

Adjacent AI-research products such as Anthropic Interviewer, Conveo, Listen Labs, and Outset show that an AI interviewer can follow a reviewed guide, adapt follow-up questions, support multiple response modes, and produce traceable analysis. Recent research also warns that AI interviewers can become acknowledgement-heavy, ask compound questions, probe too little, interrupt, lose information, or terminate prematurely.

The reviewed evidence did **not** establish that any premium matchmaker currently offers the full Argent concept: applicant-controlled switching among structured, typed, voice, and hybrid modes; an editable source record; field-level approval and provenance; and matchmaker-facing structured output. That is a differentiated opportunity, not proof of worldwide uniqueness. A formal collision review and user testing are still required before marketing the experience as unique or better.

## Product thesis

The distinctive experience is a private conversation that remembers what the candidate has already said, asks one relevant question at a time, explains why sensitive information is useful, and lets the candidate decide what enters their profile.

The interview has two coordinated layers:

1. A versioned **interview guide** defines required topics, approved optional probes, sensitive-topic boundaries, stop conditions, and field mappings.
2. A constrained **adaptive planner** selects the next permitted question using approved answers, missing required topics, contradictions, candidate preferences, and explicit uncertainty.

Every generated question must store the guide version, prompt/model version, reason code, source references used, and disposition. The model may vary wording and follow-up order, but it may not invent a new purpose, infer a protected or intimate trait, diagnose, rank desirability, or make admission or matching decisions.

## Candidate experience

### Modes

- **Structured:** ordinary form controls with optional examples and human help.
- **Typed conversation:** one-question-at-a-time interview with editable answers.
- **Voice conversation:** explicit record/stop, visible live transcript, and no passive listening.
- **Hybrid:** switch between typing, speaking, and structured controls per question.

Mode choice is not a quality signal and cannot affect admission, visibility, ranking, or staff expectations. A candidate can pause, skip optional topics, say “prefer not to answer,” request clarification, move back to the form, and resume later.

### Organic without opaque

- Ask one short question at a time.
- Ground follow-ups in something the candidate approved or in an explicit missing topic.
- Use acknowledgement sparingly; do not simulate friendship, therapy, or romantic interest.
- Show progress by topics covered, not by a fake personality score.
- Explain why a sensitive question is relevant before asking it.
- Let the candidate inspect and edit the final matchmaker-facing profile.
- Escalate to a human when the candidate requests help, the system is uncertain, or a safety/privacy boundary is reached.

## Candidate intelligence and admin boundary

The candidate database should support human discovery and cohort operations without creating a hidden compatibility score.

Store separately:

- identity and account data;
- application and interview source artifacts;
- applicant-approved profile assertions with field-level provenance;
- explicit constraints, preferences, availability, geography, and recency;
- staff-authored notes with purpose and visibility;
- verification and safety records under narrower access;
- interview guide/question/model versions and execution cost;
- privacy-safe analytics events in a separate schema.

The first admin analytics should answer operational questions: supply by approved criteria, profile completeness and freshness, consent/availability status, application funnel by mode, interview completion/correction burden, search coverage, shortlist throughput, and introduction outcomes with honest denominators. It must not produce an overall candidate value, attractiveness, personality, wealth, compatibility, or likelihood-of-relationship score.

## Feature-flag rollout

Vercel flag `candidate-interviewing` was created on 2026-08-24 for the linked `montecito-matchmaker` project.

- Production: off.
- Preview: off.
- Development: on.
- The flag gates entry into the interview experience; it does not replace authorization, consent, retention, or provider kill switches.
- Rollout order: synthetic development fixtures, internal preview cohort, approved research cohort, invited text-first beta, then separately approved voice cohort.
- Rollback: turn the flag off, preserve resumable drafts, stop new AI work, and route candidates to the structured form or human assistance.

The repository now evaluates the flag on the `/prototype` server page and fails
closed for false, malformed, or failed evaluations. Mid-session disable,
resumable fallback, cohort governance, monitoring, and production rollout gates
remain part of `ARG-111` and `ARG-613`; no real-person production route has been
authorized.

## AI cost and fee analysis

Illustrative API-only estimates, using published prices on 2026-08-24:

- A 15-minute typed interview using about 20,000 input and 5,000 output tokens is roughly **$0.01** on GPT-5.6 Luna or **$0.10** on GPT-5.6 Terra.
- Twenty minutes of `gpt-transcribe` is roughly **$0.09** before language-model generation, storage, retries, observability, and support.
- Realtime speech-to-speech cost is more variable and must be measured with a canary because turn length, silence, interruptions, cached context, and synthesized speech materially change usage.

These are planning estimates, not a provider selection or budget. Total cost of goods must include transcription, generation, speech output if used, moderation, storage, retries, evaluation sampling, telemetry, support, payment fees, and abuse.

### Fee recommendation

Do not charge candidates a per-submission AI fee in the first pilot. The marginal AI estimate does not justify the conversion, representation, dispute, and pay-to-be-considered risk. Keep structured and typed intake free; include bounded voice/hybrid access for invited candidates; absorb usage into client-service or acquisition economics; and control abuse with verified accounts, invites, rate limits, time/turn quotas, and spend kill switches.

If the team later considers a deposit, it should be tied to scarce human concierge time rather than admission or consideration, and requires founder, legal, pricing, refund, accessibility, and fairness approval.

## Privacy, consent, and provider boundary

- California Penal Code section 632 generally requires all-party consent before intentionally recording a confidential communication. Counsel must approve the exact notice, jurisdiction handling, and bystander path.
- Interview content may include sensitive personal information and inferences. Purpose, access, retention, correction, deletion, and downstream visibility must be field- and artifact-specific.
- Provider claims must match configuration. OpenAI states API data is not used for model training unless a customer opts in, but default abuse-monitoring retention may be up to 30 days and some endpoints retain application state. Provider selection must test the exact endpoint, `store` behavior, contract, deletion path, region, and eligibility for Modified Abuse Monitoring or Zero Data Retention.
- Raw audio is ephemeral by default; transcript and rejected proposals do not enter matching search, product analytics, or training data.
- Prohibit voiceprint, emotion, accent, deception, attractiveness, protected-trait, health, sexual-behavior, personality-diagnosis, and wealth inference.

## MVP and non-goals

### Text-first MVP

- candidate chooses structured, typed conversation, or hybrid typing/form mode;
- versioned guide with required topics and approved probe library;
- constrained adaptive next-question planning;
- pause/resume and mode switching;
- editable source answers and field-by-field approval;
- source-grounded structured assertions with provenance;
- human review queue and candidate-visible final review;
- per-session usage/cost ledger, limits, telemetry, and kill switch;
- synthetic and approved research evaluation before real rollout.

### Explicit non-goals

- autonomous admission, rejection, matching, compatibility scoring, or candidate ranking;
- simulated therapist, friend, romantic partner, or human matchmaker;
- passive listening or continuous ambient capture;
- video or facial analysis;
- inferred emotion, accent, deception, desirability, wealth, protected traits, diagnosis, or sexual behavior;
- greater disclosure as a success metric;
- charging for consideration in the initial pilot;
- voice launch before text, consent, accessibility, and deletion gates pass.

## Success and launch gates

- Candidate control: mode-switch success, pause/resume, correction, deletion, and final-review comprehension.
- Quality: guide-topic coverage, single-question turns, source-support, applicant edit/reject rate, and human usefulness.
- Trust: AI disclosure comprehension, sensitive oversharing, third-party disclosure, prohibited inference, and human-handoff success.
- Fairness/accessibility: completion and error differences by approved cohorts, equivalent non-voice route, no mode-based admission effect.
- Operations: review time, stale data, candidate-search coverage, and correction workload.
- Economics: cost per completed interview by mode/model, p50/p95 latency, retry rate, spend per cohort, and kill-switch verification.

No external real-person beta starts until product, privacy/legal, accessibility, AI safety, data, and operational owners approve thresholds and rollback.

## Sources

- Tawkify FAQ: <https://tawkify.com/faq>
- Tawkify post-signup timeline: <https://tawkify.zendesk.com/hc/en-us/articles/14031553139739-What-is-the-timeline-after-signing-up-for-Tawkify>
- Selective Search process: <https://www.selectivesearch.com/one-on-one-matchmaking/>
- Kelleher International process: <https://kelleher-international.com/>
- It's Just Lunch process: <https://datingregistry.itsjustlunch.com/our-process>
- Anthropic Interviewer: <https://www.anthropic.com/about-anthropic-interviewer>
- Anthropic Interviewer research: <https://www.anthropic.com/research/anthropic-interviewer>
- Conveo: <https://conveo.ai/product>
- Listen Labs: <https://listenlabs.com/>
- Outset interviews: <https://outset.ai/platform/interviews>
- When the Interviewer Is a Bot: <https://arxiv.org/abs/2608.10412>
- SparkMe adaptive interviewing: <https://arxiv.org/abs/2602.21136>
- OpenAI model pricing: <https://developers.openai.com/api/docs/models>
- OpenAI API data controls: <https://developers.openai.com/api/docs/guides/your-data>
- Vercel Flags pricing: <https://vercel.com/docs/flags/vercel-flags/limits-and-pricing>
- California Penal Code section 632: <https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632.>
- California Privacy Protection Agency FAQ: <https://cppa.ca.gov/faq>
- FTC, AI companies and privacy commitments: <https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/01/ai-companies-uphold-your-privacy-confidentiality-commitments>
