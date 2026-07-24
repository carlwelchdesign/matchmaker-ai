# Match Science Research and Validation Plan

## Status and implementation gate

This is the initial evidence review for `ARG-026`. It defines what Argent may research and prototype; it does not approve a compatibility algorithm.

`ARG-502`, `ARG-605`, and `ARG-606` must not implement personality-based ranking, a universal compatibility score, or predictive claims until the construct register, prospective validation plan, privacy review, and AI use-case contract are approved.

## Product position

Argent should offer **evidence-informed candidate discovery plus expert human matchmaking**. It must not claim that software can predict love, relationship success, or a person's character.

The evidence supports collecting relevant facts, improving retrieval, explaining why a person was surfaced, and helping a matchmaker reason consistently. It does not support reducing two people to personality vectors and presenting a compatibility percentage.

## Evidence review

| Evidence | Finding | Product consequence |
| --- | --- | --- |
| Joel, Eastwick, and Finkel (2017) | Machine-learning models using more than 100 traits and preferences could not predict person-specific romantic desire before people met | Do not market pre-meeting attraction prediction or treat a larger questionnaire as proof of predictive power |
| Joel et al. (2020) | Across 43 longitudinal datasets and 11,196 couples, relationship-specific perceptions were more informative than many individual differences; change in relationship quality remained difficult to predict | Capture real interaction feedback over time, but do not convert it into a universal compatibility label |
| Weidmann et al. (2023) | Personality similarity was not robustly associated with relationship satisfaction across 1,294 couples | Do not rank people primarily by personality similarity |
| Dyrenforth et al. (2010) | Personality similarity explained less than 0.5% of relationship-satisfaction variance in three national samples | Similarity is not a defensible primary matching rule |
| Eastwick et al. (2023) | A preregistered study found limited evidence for person-by-partner compatibility effects and did not support ideal-preference matching as a simple rule | Treat stated ideals as context and preference, not a deterministic formula |
| McCrae and Costa (1989) | MBTI results did not support truly dichotomous types or the proposed Jungian interpretation | Do not use MBTI type pairings as a compatibility engine |

## Permitted construct classes

### Appropriate for structured intake

- relationship intent, desired relationship structure, and readiness;
- location, willingness to travel or relocate, availability, and scheduling realities;
- family plans, children, caregiving, and other explicitly volunteered life goals;
- explicit hard boundaries, dealbreakers, and safety constraints;
- values, interests, lifestyle preferences, and communication preferences in the person's own words;
- consent and privacy boundaries;
- matchmaker observations that are labeled as observations, attributed, and reviewable.

These facts still require purpose limitation, visibility rules, freshness, and an `unknown` state.

### Exploratory and gated

- continuous Big Five or HEXACO traits;
- validated attachment, communication, or conflict-style measures;
- structured behavioral examples supplied by the person.

Any such measure requires a construct owner, evidence grade, validated instrument, license review, user-facing purpose, burden assessment, privacy classification, accessibility review, and a narrow permitted use. It may support a conversation or matchmaker review; it may not silently become a score or exclusion rule.

### Prohibited as matching signals

- MBTI type-pairing rules;
- zodiac signs, love-language labels, or similar typologies as compatibility predictors;
- inferred narcissism, personality disorder, honesty, emotional maturity, wealth, or character;
- personality inference from voice, face, appearance, writing style, occupation, neighborhood, or demographics;
- a “wealthy male” or any demographic stereotype;
- a single compatibility percentage or prediction of attraction, date success, or relationship success.

Argent may let a user discuss a framework such as MBTI as part of their self-description, but the label remains user-provided context and cannot determine ranking or eligibility.

## Proposed matching boundary

1. Apply deterministic eligibility, consent, safety, availability, and explicit hard-constraint filters.
2. Retrieve on visible, structured preferences with `required`, `preferred`, and `unknown` semantics.
3. Optionally retrieve semantically similar **approved and allowlisted** narrative fields.
4. Produce an evidence bundle showing supporting facts, conflicts, missing data, freshness, and uncertainty.
5. Let a matchmaker create or reject a shortlist; the system does not assign a compatibility verdict.
6. Ask each participant for independent consent before an introduction.
7. Record outcomes using a defined taxonomy and preserve the selection process that produced them.

Embeddings are an index for retrieval, not a psychological model. They must not contain raw recordings, unapproved transcripts, safety notes, verification records, or prohibited inferred traits.

## Construct register

Before any construct affects retrieval or a recommendation, record:

| Field | Requirement |
| --- | --- |
| Construct | Human-readable definition and what it explicitly does not mean |
| Operational purpose | User and matchmaker decision the field supports |
| Collection method | Exact question, instrument, observation, or source |
| Evidence grade | Study quality, population fit, replication, and important limitations |
| Measurement quality | Reliability, validity, uncertainty, and known subgroup limitations |
| License | Instrument and scoring rights |
| Burden | Time, sensitivity, accessibility, and likely abandonment |
| Data class | Privacy class, visibility, retention, and consent |
| Permitted use | Retrieval, explanation, conversation aid, or research only |
| Prohibited use | Admission, diagnosis, exclusion, or automated compatibility score |
| Provenance | Who supplied or approved it, when, and from which source version |
| Review date | Named owner, expiry, and reevaluation trigger |

## Outcome taxonomy

Argent must not collapse outcomes into one “successful match” label. Track separate events with their own denominator and visibility:

- candidate retrieved and matchmaker reviewed;
- candidate added to a shortlist;
- matchmaker recommends an introduction;
- each participant independently accepts or declines;
- introduction is delivered;
- first meeting occurs;
- each person separately expresses interest in another meeting;
- respectful closure or safety concern;
- relationship is self-reported at defined intervals such as 3, 6, and 12 months;
- participant-reported service quality and sense of being understood.

Declines and missing feedback are not evidence that a person is undesirable. Outcomes are delayed, subjective, sparse, and heavily shaped by who was shown to whom.

## Research program before implementation

1. Complete a structured literature review with a relationship scientist or psychometrician.
2. Interview practicing high-touch matchmakers and document their observable decision process.
3. Create the construct register and remove any construct without a defensible purpose.
4. Test a manual, transparent rubric using synthetic or explicitly consented historical cases.
5. Write prospective hypotheses and evaluation metrics before reviewing pilot outcomes.
6. Validate retrieval quality, explanation usefulness, subgroup behavior, missing-data behavior, and matchmaker agreement.
7. Run a small prospective pilot with human-only decisions and record the full selection funnel.
8. Require legal, privacy, safety, and claims review before public statements about the method.

The initial dataset will be too small and selected to train a trustworthy compatibility model. Cold start, missing counterfactuals, feedback nonresponse, label leakage, matchmaker selection, and changing preferences must be treated as central limitations.

## Gate checklist

- [ ] Relationship-science or psychometrics reviewer assigned.
- [ ] Literature review and evidence grades approved.
- [ ] Construct register approved, including licenses and prohibited uses.
- [ ] Matching claims and applicant language reviewed.
- [ ] Privacy and sensitive-data classifications approved.
- [ ] Prospective pilot protocol and outcome taxonomy approved.
- [ ] Fairness, missing-data, and selection-bias evaluation approved.
- [ ] AI use-case contracts and zero-tolerance tests approved.
- [ ] Human override, explanation, audit, and rollback behavior approved.
- [ ] No implementation ticket depends on a predictive compatibility score.

## Primary references

- Joel, Eastwick, and Finkel, 2017: <https://journals.sagepub.com/doi/10.1177/0956797617714580>
- Joel et al., 2020: <https://sites.lsa.umich.edu/whirl/wp-content/uploads/sites/792/2020/08/Joel-et-al-2020-PNAS.pdf>
- Weidmann et al., 2023: <https://pubmed.ncbi.nlm.nih.gov/37396145/>
- Dyrenforth et al., 2010: <https://pubmed.ncbi.nlm.nih.gov/20718544/>
- Eastwick et al., 2023: <https://journals.sagepub.com/doi/pdf/10.1177/08902070221085877>
- McCrae and Costa, 1989: <https://scholars.duke.edu/publication/1458465>
- Finkel et al., 2012 critical review: <https://pubmed.ncbi.nlm.nih.gov/26173279/>

