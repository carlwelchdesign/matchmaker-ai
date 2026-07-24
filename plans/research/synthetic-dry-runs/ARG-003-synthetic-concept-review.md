# ARG-003 Synthetic Concept Review

## Status and use

- **Evidence type:** Synthetic dry run.
- **Created:** 2026-07-24.
- **Purpose:** Stress-test the ARG-003 concept stimuli before real participant
  research.
- **Limitation:** These are planning hypotheses, not applicant, candidate,
  client, founder, or accessibility evidence. They may guide what to watch for
  in sessions but do not close ARG-003.

## Concept A — Public Argent application

### Stimulus risk review

| Phrase | Synthetic interpretation risk | Suggested watch item |
| --- | --- | --- |
| “Private, human-led matchmaking service” | Clear premium positioning, but may imply concierge access for all applicants | Ask what applicants expect after applying |
| “Anyone may apply” | Positive access signal; may conflict with “selective” if not explained | Ask whether applying sounds worth the effort |
| “Admission ... is not guaranteed” | Clear but can feel cold or school-like | Test softer status language |
| “If there may be a fit” | Accurate but vague | Ask what “fit” means to participants |

### Synthetic hypothesis

Participants may understand the no-guarantee boundary but still expect a
response timeline and a respectful closure path. This points to `ARG-018` and
`ARG-412` copy needs.

## Concept B — Montecito/Santa Barbara campaign

### Stimulus risk review

| Phrase | Synthetic interpretation risk | Suggested watch item |
| --- | --- | --- |
| “first local test ground” | Good correction to avoid making Santa Barbara the entire ICP | Ask participants to paraphrase Argent's geography |
| “up to 100 men and 100 women” | May sound binary, quota-driven, or like a casting call | Test inclusive alternatives and capacity framing |
| “partnering with Argent” | May blur who controls data and decisions | Ask who participants think sees application data |
| “does not guarantee admission” | Necessary but repeated no-guarantee copy may feel defensive | Test placement and tone |

### Synthetic hypothesis

The `100/100` phrase is operationally useful but high-risk as public copy. It
should likely remain an internal target or be reframed as “limited local beta
capacity” unless real testing proves it is understood correctly.

## Concept C — Intake mode choice

### Stimulus risk review

| Phrase | Synthetic interpretation risk | Suggested watch item |
| --- | --- | --- |
| “structured questions” | Clear and safe, may feel generic | Ask if it feels premium enough |
| “guided conversational path” | Helpful for expression, but may imply chatbot judgment | Ask what AI is doing |
| “same reviewable application” | Strong fairness signal | Ask if participants believe it |
| “approve, edit, or reject” | Strong control signal | Test whether this is enough for voice/transcript comfort |

### Synthetic hypothesis

The most important trust copy is not “AI-assisted”; it is “same reviewable
application” and “you approve what is saved.” This should drive `ARG-027` and
`ARG-613` prototype requirements.

## Concept D — Status language

### Stimulus risk review

| Status | Synthetic interpretation risk | Suggested watch item |
| --- | --- | --- |
| Submitted | Clear, low risk | Ask if receipt/timeline is expected |
| In review | Clear, may imply active human review immediately | Ask expected timeframe |
| Needs information | Clear, but could feel like a deficiency | Test tone |
| Waitlisted | Familiar, but can imply future priority | Ask what waitlist means |
| Not admitted | Honest, but may feel institutional or judgmental | Compare with “not moving forward” |
| Withdrawn | Clear if participant initiated it | Test privacy/deletion expectations |

### Synthetic hypothesis

Status copy needs paired “what this means / what this does not mean” language.
This should feed `ARG-013`, `ARG-016`, and `ARG-412`.

## Concept E — Paying client service promise

### Stimulus risk review

| Phrase | Synthetic interpretation risk | Suggested watch item |
| --- | --- | --- |
| “defined, human-led search process” | Clear and premium | Ask what deliverables are expected |
| “does not promise a match, date, relationship” | Clear boundary; may reduce perceived value if not balanced with process quality | Test tone with paying-client segment |
| “processed through Stripe” | Trustworthy to some, distracting to others | Ask whether processor needs to appear in marketing copy |
| “payment does not improve compatibility ranking” | Important trust boundary | Ask if participants assumed paid priority |

### Synthetic hypothesis

Pricing/payment copy belongs closer to checkout/service agreement than public
positioning. Public copy should emphasize process; checkout copy should define
package, term, refund, and non-guarantees.

## Concept F — AI assistance boundary

### Stimulus risk review

| Phrase | Synthetic interpretation risk | Suggested watch item |
| --- | --- | --- |
| “summarize approved application answers” | Good source-grounded boundary | Ask if summaries feel acceptable |
| “identify missing information” | Useful, but could feel evaluative | Test phrasing |
| “retrieve relevant candidate facts” | Operationally accurate, but may sound surveillance-like | Explain permissioned facts |
| “does not admit, reject, rank, verify, or introduce” | Strong governance boundary | Ask whether anything still feels automated |

### Synthetic hypothesis

AI copy should be concrete and verb-limited. Avoid “smart match,” “compatibility
score,” “personality insights,” or “chemistry prediction.”

## Synthetic language classification

| Term | Synthetic classification | Rationale |
| --- | --- | --- |
| elite | Needs revision | Can support brand if tied to service quality; risky if tied to worth/status |
| selective | Approved with explanation | Accurate if paired with human review and no guarantee |
| private network | Needs revision | Needs “who can see what” explanation |
| accepted | Policy escalation | Must specify accepted into what: network, campaign, client service, terms |
| waitlisted | Needs revision | Must define no priority/guarantee |
| verified | Policy escalation | Must define checks and limits |
| invite | Needs revision | Must not imply admission or endorsement |
| referral | Needs revision | Must not imply priority or partner visibility |
| match | Needs revision | Prefer curated introduction for service copy |
| curated introduction | Approved language | Process-oriented and human-led |
| AI-assisted | Needs revision | Must specify permitted verbs |
| human-reviewed | Approved language | Supports trust if true operationally |
| confidential | Policy escalation | Must be backed by actual data/privacy controls |

## Synthetic findings

| Finding ID | Finding | Classification | Confidence | Severity | Downstream tickets |
| --- | --- | --- | --- | --- | --- |
| ARG003-SYN-001 | `100 men / 100 women` may create quota, binary-gender, or casting-call interpretation. | Needs revision | Medium | High | ARG-014 ARG-016 ARG-301 |
| ARG003-SYN-002 | `accepted` and `verified` are high-risk unless tied to exact lifecycle/check definitions. | Policy escalation | High | High | ARG-005 ARG-006 ARG-013 ARG-016 |
| ARG003-SYN-003 | Intake choice copy should emphasize equal review treatment and user approval of saved fields. | Approved direction | Medium | Medium | ARG-018 ARG-027 ARG-613 |
| ARG003-SYN-004 | AI language should use concrete permitted verbs and explicit prohibited verbs. | Approved direction | High | High | ARG-020 ARG-026 ARG-027 |
| ARG003-SYN-005 | No-guarantee language is necessary but needs service-quality balancing for paying clients. | Needs revision | Medium | Medium | ARG-010 ARG-017 |

## Questions for real participant sessions

- Do applicants perceive “not admitted” as more respectful than “declined”?
- Does “elite” feel premium or exclusionary when paired with discretion/service
  quality?
- Does “private network” create unrealistic safety or visibility assumptions?
- Do potential clients expect payment to include a minimum number of
  introductions?
- Does mentioning Stripe increase trust or distract from the service promise?
- Do participants understand that all intake modes produce the same reviewable
  application?
