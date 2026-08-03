# Founder meeting synthesis — 2026-08-03

## Source and status

This is a planning synthesis of a meeting among the founder, engineering, and an adviser. It is not a contract, legal advice, a pricing commitment, or authorization to collect, import, share, or process real applicant data. Personal names, examples, and commercially sensitive anecdotes from the raw transcript are intentionally omitted.

**Decision authority:** Jenny (founder) owns product, service, pricing, and partner-network decisions. Carl owns technical feasibility and delivery estimates. The adviser role and any commercial authority remain to be confirmed.

## The clarified product

Argent is a **human-led, high-touch matchmaking operation with private operating software**. It is not a swipe product, a public dating directory, or an automated relationship-prediction service.

The near-term product has two independently deployed web experiences:

1. A polished, public campaign and application experience for people who want to be considered.
2. A private Argent operations workspace for the founder and authorized staff to build a consented candidate network, manage clients, evaluate evidence, search, shortlist, coordinate introductions, and track work.

Mobile apps are **deferred from the first operational release**. Reconsider them only after the web workflow proves a genuine mobile-specific need. This is a meeting direction pending founder confirmation because it changes the earlier cross-platform sequence, not the long-term Flutter decision.

## Proposed service taxonomy

These terms should replace the overloaded phrase "database member" in product copy, policies, and data models.

| Term | Meaning | What Argent may do | What Argent may not imply |
| --- | --- | --- | --- |
| Applicant | A person who has started or submitted an application. | Request completion, review the submission, or ask approved follow-up questions. | Admission, verification, availability, or eligibility. |
| Candidate | A person Argent has accepted into its private candidate network. | Maintain an approved profile and contact them under their communication preferences. | That Argent actively represents them or guarantees introductions. |
| Premier candidate | A candidate who has completed a founder-led interview and has a recent, documented availability/accuracy review. | Give staff higher-confidence context and recency signals. | Personal worth, attractiveness, priority for a particular client, or a guaranteed match. |
| Client | A person who has a signed, paid concierge engagement with Argent. | Receive contracted matchmaking service and approved add-ons. | A guaranteed number of relationships or outcomes. |
| Partner-shareable candidate | A candidate who has separately opted into a narrowly defined external-matchmaker referral purpose. | Be presented using the minimum approved disclosure to named/authorized partner channels. | Sale of the person, broad marketplace visibility, or perpetual sharing. |

**Important language change:** referral fees compensate matchmaker services and an approved introduction process; Argent must never describe people as being bought, sold, or as inventory.

## What the meeting appears to decide

| Direction | Confidence | What must still be written down |
| --- | --- | --- |
| Build Argent’s proprietary candidate network; do not depend on an external marketplace for the first release. | Strong | Data ownership, consent, retention, and the exact sharing policy. |
| Grow the network through geographically targeted recruiting campaigns, beginning locally but expanding by campaign. | Strong | Campaign eligibility, quotas, geographic rules, ad audience policy, and measurement. |
| Use a web-first public application and private owner/admin workspace. | Strong | Founder confirmation that native iOS/Android are deferred. |
| Offer structured forms plus an optional conversational experience that helps applicants complete richer profiles. | Strong direction, gated | Consent, accessibility, model/provider, review, correction, deletion, and cost controls. |
| Keep final admission, profile interpretation, matching, and introductions with a human matchmaker. | Strong | Staff review rubric and auditable lifecycle policy. |
| Consider future partner-network/referral workflows (for example HoneyBee/Pollinator), with selective sharing rather than wholesale sync. | Future only | Provider terms, API capability, source consent, disclosure, revocation, audit, and manual fallback. |
| Configure pricing and service add-ons per client; do not hardcode a universal price. | Strong | Contract templates, refunds, referral economics, taxes, and Stripe configuration. |

## AI: acceptable first use versus prohibited behavior

### Candidate-safe assistance to research and prototype

- Identify incomplete, conflicting, or stale application fields.
- Ask an applicant a relevant follow-up question, then present the resulting field as a proposal with its source context.
- Produce staff-facing, source-grounded summaries and search aids.
- Retrieve candidate records only after deterministic permission, consent, lifecycle, and availability filters.
- Flag a record for human review; record the source and confidence of the flag.

### Not authorized by this meeting

- Automatically "weed out," admit, decline, or charge applicants based on AI output.
- Infer wealth, personality pathology, attractiveness, race, religion, gender roles, or relationship potential from a conversation or profile.
- Predict chemistry, a successful relationship, or a match outcome.
- Scrape, copy, or ingest external marketplace profiles without documented rights and purpose-specific consent.
- Use a paid AI interview as a path to preferential consideration before a policy, fairness, and commerce review.

The product language should be: **AI helps an authorized matchmaker organize information and ask better follow-up questions. It does not decide who belongs, who is valuable, or who should meet.**

## Operational implications

### Candidate-network growth

The first campaign is a recruiting hypothesis, not a promise of a specific number of people. Each campaign needs:

- a target geography and eligibility statement;
- a campaign landing page and branded application;
- invitation/referral attribution, quotas, waitlist, pause, and closure controls;
- accessibility and clear privacy/communications notices;
- a founder-reviewed conversion and quality metric plan;
- consented, privacy-safe advertising attribution rather than personal-data ad targeting.

Meta/Instagram can be a paid-acquisition channel. It is not an applicant source, identity-verification method, or a reason to send sensitive profile data to Meta.

### Referral/partner collaboration

Future collaboration needs an explicit, reversible workflow:

1. Candidate opts in to a defined partner-introduction purpose.
2. Staff chooses the minimum permitted profile summary for a named opportunity/channel.
3. A partner may express interest; no identity details are shared until Argent and the candidate approve the next step.
4. Any referral fee, payment status, and outcome are recorded as a service transaction.
5. Opt-out, expiry, and revocation immediately remove future access and trigger a review of outstanding shares.

No initial release should promise a HoneyBee API connection. HoneyBee publicly advertises API and real-time integration only on custom plans, but its public site does not document a self-service people-data API. Validate the actual contract and sandbox before creating a ticket to integrate it.

### Client service and pricing

The meeting describes a concierge package with optional, individualized service expenses (for example coaching, photography, dates, and third-party referral fees). This supports a configurable client-service ledger, not a one-price subscription.

Decisions still required:

- Is a future candidate membership fee allowed, and if so what tangible service does it buy without implying admission or a match?
- Are candidate interviews free, paid, or paid only after acceptance? What happens if no introduction follows?
- Who receives and bears a partner referral fee, and under what written agreement?
- Which costs are included in a client package, pre-approved separately, capped, refundable, or pass-through?
- What is Argent’s contract promise: a defined service effort, a number of introductions/dates, a period of service, or some combination?

Stripe should process only approved commercial transactions. Argent must never receive, store, or transmit raw card images or card numbers.

## Security and privacy observations

1. **Separate admin is not a security control by itself.** An independently deployed admin application is correct, but it requires MFA, deny-by-default roles, object-level authorization, audit logging, session controls, rate limits, secure recovery, and private media access. A hidden or non-obvious URL is only a minor friction layer.
2. **Photos, interview notes, availability, and partner history are highly sensitive.** Collect the minimum, keep purpose and source on every field, set retention rules, and prohibit raw profile data in logs, analytics, test fixtures, and unapproved model prompts.
3. **Do not accept card photographs in messages or source control.** If any card image has been sent through personal messaging, delete it from accessible threads/devices where possible, stop using it, and have the cardholder work with the issuer if exposure is uncertain. Replace this with customer-owned vendor accounts and vendor-hosted payment entry.
4. **AI interview data needs a separate consent boundary.** Text may be tested locally only as a non-persistent concept. Audio, transcription, sentiment analysis, and model processing require explicit disclosure, alternatives, correction/approval, deletion, vendor review, and accessibility testing before production use.
5. **External data has no implied portability.** The fact that a profile is viewable in a matchmaking marketplace does not grant Argent permission to copy, model-train on, or import it.

## Research and decision gates

| Priority | Gate | Owner | Existing plan coverage | Deliverable |
| --- | --- | --- | --- | --- |
| P0 | Founder lifecycle and terminology approval | Jenny | ARG-005, ARG-013 | Approved lifecycle diagram, definitions, allowed staff actions, and customer-facing language. |
| P0 | Service pricing, referral economics, contracts, and refunds | Jenny + qualified counsel | ARG-010, ARG-017 | Pilot package model, cost ledger, written referral policy, Stripe decision, and no-guarantee terms. |
| P0 | Privacy, consent, sharing, and retention model | Jenny + privacy counsel + Carl | ARG-006, ARG-022, ARG-206, ARG-210, ARG-212 | Data map, notices, candidate/partner sharing consents, retention and withdrawal matrix. |
| P0 | HoneyBee/marketplace feasibility | Jenny + Carl | ARG-008, DEC-019 | Provider questionnaire, written capability/terms answer, sandbox path, and manual fallback decision. |
| P0 | AI-assisted intake contract | Jenny + Carl | ARG-020, ARG-027, ARG-028, ARG-613 | Approved text-first flow, question policy, field approval UX, evaluation rubric, cost cap, and provider boundary. |
| P0 | Web-first alpha scope and November conference objective | Jenny + Carl | ARG-009, ARG-012, ARG-018, ARG-401–409 | A time-boxed scope: what can be demonstrated versus safely used with real applicants. |
| P1 | Campaign acquisition and Meta/Instagram plan | Jenny + marketing owner | ARG-301–311, ARG-021 | Audience policy, creative/landing-page review, attribution plan, spend guardrails, and conversion metrics. |
| P1 | Admin access and operating procedures | Jenny + Carl | ARG-201–205, ARG-406–407 | Staff roles, MFA/approval workflow, review rubric, audit events, support/escalation process. |
| P1 | Mobile reconsideration | Jenny + Carl | ARG-701–708 | Evidence that a defined member workflow needs native mobile beyond responsive web. |

## Recommended web-first alpha slice

This is the smallest coherent product to estimate after the P0 gates—not an authorization to build production personal-data handling yet.

- One controlled campaign landing page, with clear selective-admission and privacy language.
- A structured, accessible, resumable web application with review-before-submit.
- A private admin queue for authorized staff: review, request information, schedule interview, change lifecycle status, and document rationale.
- Candidate records with source, consent, interview/recency, availability, and field-level provenance.
- Basic permission-aware search, saved shortlists, and human-authored notes—no compatibility score or automatic introduction.
- Notification, audit, security, backup, and operational basics needed for this sensitive workflow.

Defer for this alpha: native mobile apps, voice intake, public profile browsing, HoneyBee syncing, partner marketplace, autonomous AI recommendation, identity verification automation, advanced billing, and broad social-media automation.

## Commercial relationship: immediate non-product task

Before meaningful production implementation or spending, document a written agreement between Jenny/Argent and the development team. At minimum it should cover:

- a paid discovery/prototype or milestone-based implementation fee;
- scope, acceptance criteria, change control, and support/on-call boundaries;
- who owns source code, domains, cloud accounts, vendor accounts, data, and credentials;
- who pays recurring providers and how spend caps/approval work;
- whether any revenue share is gross revenue, net revenue, profit, or equity—and its term, reporting, audit, minimums, termination, buyout, dilution, and what happens if the venture closes;
- confidentiality, security duties, intellectual-property rights, insurance, warranty limitations, and dispute resolution.

Do not use a verbal percentage or a card image as a substitute for this agreement. Engage a business attorney licensed in the relevant jurisdiction for the commercial and privacy terms.

## Next founder decisions (one meeting)

1. Confirm the five service states in the proposed taxonomy, including whether “premier candidate” is the right customer-facing name.
2. Confirm that the first operational release is responsive web plus a separate admin, with native mobile deferred.
3. Choose the first campaign’s geographic scope, target, eligibility language, quota, and success measure.
4. Choose the initial applicant/candidate pricing policy and client package promise.
5. Decide whether candidates can ever opt into partner referrals; if yes, approve the narrow purpose and the minimum information that may be shown.
6. Approve text-first conversational assistance as a research item, not a production voice feature.
7. Authorize HoneyBee outreach using the provider question set below.
8. Decide whether the November 6 conference goal is a visual demo, an internal operational alpha, or a real applicant launch. Only the last requires the P0 privacy, security, and contract gates.

## HoneyBee outreach questions

- Is the Custom-plan API available to HoneyBee Match customers, and is there a sandbox plus technical documentation?
- Which objects can Argent read, create, update, or export? Are candidate profiles, media, messages, match proposals, and financial/referral records included?
- Does the API support webhooks, selective profile publication, external IDs, revocation, and audit records?
- Can a matchmaker choose exactly which profiles enter Pollinator or other sharing channels? What consent and terms are required?
- Does HoneyBee permit extraction, local storage, AI processing, or re-sharing of profile information? Under what agreement and retention restrictions?
- What authentication, tenant isolation, rate limits, breach-notification commitments, data residency, and deletion/export mechanisms apply?
- What is the custom-plan commercial model, implementation support, and support/SLA commitment?

## Traceability note

No tickets are marked ready by this meeting alone. The existing backlog already covers the core work; the decisions and research gates above should update those tickets after Jenny explicitly approves the unresolved service, pricing, privacy, and partner-data policies.
