# Risk Register

Scoring: impact and likelihood are `1` (low) to `5` (critical/high). Score is their product. Owners and deadlines must be named before the related implementation phase begins.

| ID | Risk | Impact | Likelihood | Score | Mitigation/gate | Owner | Trigger/deadline | Status |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
| R-001 | Sensitive profile, media, or safety data is exposed | 5 | 3 | 15 | ARG-007 ARG-202 ARG-208 ARG-211 ARG-804 | Unassigned security owner | Before real profiles | Open |
| R-002 | Campaign consent is mistaken for broad Argent-network consent | 5 | 3 | 15 | ARG-006 ARG-015 ARG-206 ARG-212 | Unassigned privacy owner | Before intake build | Open |
| R-003 | AI produces discriminatory, appearance-based, or unsupported judgments | 5 | 4 | 20 | ARG-020 ARG-607 ARG-608 ARG-610 | Unassigned AI owner | Before any AI beta | Open |
| R-004 | “Elite” positioning becomes exclusionary or damages trust | 4 | 3 | 12 | Research, content principles, inclusive copy review, complaint monitoring | Founder/product | Before brand approval | Open |
| R-005 | Partner users gain access beyond their campaign purpose | 5 | 3 | 15 | ARG-015 ARG-204 ARG-213 ARG-802 | Security/engineering | Before partner access | Open |
| R-006 | Identity/background checks create false confidence or disputes | 5 | 3 | 15 | ARG-006 ARG-008 ARG-408 ARG-412 ARG-413 | Legal/privacy | Before provider contract | Open |
| R-007 | Duplicate people create conflicting consent or match history | 4 | 4 | 16 | ARG-013 ARG-404 ARG-115 | Data owner | Before multiple campaigns | Open |
| R-008 | The team overbuilds AI/mobile before validating operations | 4 | 4 | 16 | ARG-009 ARG-011 ARG-012 and milestone gates | Product owner | Phase 0 review | Open |
| R-009 | External APIs or partner sites prohibit desired automation | 4 | 3 | 12 | Contract/API feasibility matrix and manual fallback | Integration owner | Before integration tickets | Open |
| R-010 | Cross-company data collaboration lacks lawful permission or contracts | 5 | 3 | 15 | Deferred by DEC-010; ARG-006 ARG-015 and new expansion gate required | Founder/legal | Before collaboration design | Open |
| R-011 | Paid premium placement corrupts match trust | 4 | 2 | 8 | Keep paid ranking out of MVP; monetize service quality instead | Founder/product | Business-model decision | Open |
| R-012 | Campaign traffic or media spikes degrade intake | 3 | 3 | 9 | Load envelope, direct uploads, queues, backpressure, monitoring | Platform owner | Before launch rehearsal | Open |
| R-013 | Notification content leaks sensitive information | 4 | 3 | 12 | Minimal lock-screen copy, preference controls, templates, review tests | Mobile/product | Before push/SMS | Open |
| R-014 | Restore reintroduces deleted or withdrawn data | 5 | 2 | 10 | Deletion ledger, backup policy, post-restore reconciliation test | Data/security | Before production backup approval | Open |
| R-015 | Mobile API changes strand older app versions | 3 | 3 | 9 | Versioned contracts, compatibility window, forced-upgrade policy | Mobile/API owners | Before app-store beta | Open |
| R-016 | Matchmakers work around the system due to poor workflow fit | 4 | 4 | 16 | ARG-002 ARG-012 ARG-018 ARG-808 | Product/design | Before Phase 2 build | Open |
| R-017 | Founder or staff access becomes a single point of compromise | 5 | 3 | 15 | ARG-201 ARG-202 ARG-203 ARG-211 | Security owner | Before production access | Open |
| R-018 | Provider/model costs grow unexpectedly | 3 | 3 | 9 | Per-use budgets, queue limits, caching where safe, dashboards, kill switches | AI/platform | Before AI rollout | Open |
| R-019 | International ambitions create premature regulatory/operational scope | 4 | 3 | 12 | US/local beta only; jurisdiction gate before expansion | Founder/legal | Roadmap expansion review | Open |
| R-020 | No remote repository or review automation prevents PR governance | 3 | 5 | 15 | ARG-100 ARG-104 ARG-117 | Repository owner | Before implementation tickets | Open |
| R-021 | Service promise fees refunds or fulfillment remain unclear | 5 | 3 | 15 | ARG-010 ARG-017 and counsel review before payment | Founder | Before service offer | Open |
| R-022 | Referral compensation or disclosure creates conflict or dispute | 4 | 3 | 12 | ARG-014 ARG-017 and versioned attribution | Founder/legal | Before referral launch | Open |
| R-023 | Matchmaker staffing cannot meet review or concierge promises | 4 | 4 | 16 | ARG-011 capacity envelope and pilot limits | Founder/product | Before campaign claims | Open |
| R-024 | Applicant disappointment or mass waitlisting damages reputation | 4 | 3 | 12 | ARG-013 ARG-016 ARG-412 and support SLA | Product/content | Before public campaign | Open |
| R-025 | Eligibility or selection policy creates discriminatory effects | 5 | 3 | 15 | ARG-003 ARG-013 ARG-014 legal and fairness review | Product/legal | Before criteria approval | Open |
| R-026 | Campaign supply becomes materially imbalanced | 3 | 4 | 12 | ARG-011 ARG-014 ARG-305 pause/adjust rules | Campaign owner | During pilot | Open |
| R-027 | Event/job divergence causes duplicate or missing side effects | 5 | 3 | 15 | ARG-112 and reconciliation tests | Platform owner | Before async workflows | Open |
| R-028 | Analytics or crash telemetry leaks sensitive data | 5 | 3 | 15 | ARG-021 ARG-114 payload allowlists and deletion tests | Data/privacy | Before instrumentation | Open |
| R-029 | Attribution errors affect partner reporting or compensation | 4 | 3 | 12 | ARG-014 ARG-021 ARG-310 versioned rules | Product/data | Before partner reporting | Open |
| R-030 | Model or provider behavior changes without controlled rollout | 5 | 3 | 15 | ARG-020 ARG-607–ARG-612 drift and rollback | AI owner | Before AI beta | Open |
| R-031 | Database/API migration breaks installed mobile clients | 4 | 3 | 12 | ARG-019 ARG-102 compatibility and migration tests | API/mobile owners | Before mobile beta | Open |
| R-032 | Compromised base image or dependency reaches production | 5 | 2 | 10 | ARG-104 ARG-113 provenance scanning and policy | Security/platform | Before production | Open |
| R-033 | Outcome data becomes a biased automated ranking signal | 5 | 3 | 15 | AI policy ARG-020 and feature/eval reviews | AI/product | Before outcome use | Open |
| R-034 | Consent deletion succeeds operationally but not in analytics or AI artifacts | 5 | 3 | 15 | ARG-114 ARG-212 ARG-611 restore/revocation tests | Privacy/data | Before real profiles | Open |
| R-035 | Founder is a key-person dependency for decisions and incidents | 4 | 4 | 16 | ARG-025 named deputies RACI and escalation | Founder | Before pilot | Open |
| R-036 | App-store approval delays private beta | 3 | 3 | 9 | Mobile is not on pilot critical path; web fallback | Mobile/product | Before private beta | Open |
| R-037 | Web, iOS, and Android drift into inconsistent or inaccessible visual systems | 4 | 3 | 12 | DEC-011 ADR-019 ARG-004 ARG-118 ARG-701 ARG-801 token generation drift checks and platform review | Design systems/engineering | Before user-facing implementation | Open |
| R-038 | Pseudoscientific compatibility claims or scores harm participants and Argent's trust | 5 | 4 | 20 | DEC-012 ADR-021 ARG-026 ARG-020 ARG-502 ARG-605 ARG-606 | Product/science/AI | Before matching implementation | Open |
| R-039 | Conversational intake causes oversharing, inaccurate profile data, unlawful recording, or source-data exposure | 5 | 4 | 20 | DEC-013 ADR-020 ARG-006 ARG-027 ARG-028 ARG-206 ARG-207 ARG-208 ARG-212 ARG-613 | Privacy/security/product | Before real-person voice testing | Open |
| R-040 | Class, gender, voice, or presumed-personality stereotypes bias intake, admission, or matching | 5 | 3 | 15 | DEC-014 ARG-003 ARG-026 ARG-027 ARG-608 | Product/research/AI | Before applicant prototype | Open |

## Escalation policy

- Score 15–25: cannot proceed without an approved mitigation owner and gate.
- Score 8–14: mitigation must be included in the relevant epic.
- Score 1–7: monitor and review when assumptions change.

`ARG-025` must assign one named accountable person, mitigation ticket, due date, review date, residual score, and residual-risk acceptance authority for every score 15–25 risk before related work becomes `Ready`.
