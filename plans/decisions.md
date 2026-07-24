# Decision Log

## Confirmed product decisions

| ID | Date | Decision | Rationale | Revisit trigger |
| --- | --- | --- | --- | --- |
| DEC-001 | 2026-07-23 | Company and platform brand is Argent Matchmaking | Founder direction | Formal naming/legal conflict |
| DEC-002 | 2026-07-23 | Anyone may apply, but admission is selective | Core service positioning | Research shows a different intake model is needed |
| DEC-003 | 2026-07-23 | Initial market positioning is affluent, high-end matchmaking | Founder direction | ICP or business-model validation changes |
| DEC-004 | 2026-07-23 | Partner work uses controlled campaigns inside Argent, not general multi-tenancy | Reduces initial security, data, support, and product complexity | Self-service partner demand is proven |
| DEC-005 | 2026-07-23 | Flutter will support iOS and Android | Cross-platform mobile direction | Prototype demonstrates unacceptable constraints |
| DEC-006 | 2026-07-23 | Web/API/worker workloads will be Dockerized and planned for deployment/scaling | Portability and operational consistency | Hosting decision requires a documented alternative |
| DEC-007 | 2026-07-23 | Security and privacy are architectural requirements and launch gates | Platform handles highly sensitive personal information | Never; controls may evolve |
| DEC-008 | 2026-07-23 | AI remains human-assistive for consequential decisions | Trust, fairness, and service quality | Only after explicit governance review; autonomous admission/matching remains prohibited |
| DEC-009 | 2026-07-23 | The first proof is a web/concierge operational alpha followed by a consenting service pilot | Validates the human service before AI/mobile expansion | Pilot evidence supports changing the sequence |
| DEC-015 | 2026-07-24 | Santa Barbara County/Montecito is the first geofenced beta campaign, not Argent's long-term ICP boundary | Keeps the beachhead defined by service need, privacy, and high-touch fit while preserving a concrete local test ground | Pilot evidence or operational/legal constraints justify narrowing or expanding geography |
| DEC-016 | 2026-07-24 | Paid services use admin-configured Stripe pricing, with candidate application remaining free for the first pilot | Avoids hardcoded prices, supports operational control, and reduces pay-to-be-considered risk | ARG-010/ARG-017 approve a different commerce model |
| DEC-010 | 2026-07-23 | Pilot campaign partners receive aggregate reporting only | Reduces consent, contract, breach, and UX complexity | Purpose-specific person access becomes proven and legally approved |
| DEC-011 | 2026-07-23 | Nocturne direction `02` is selected provisionally for public web, staff web, iOS, and Android | Founder selected the more distinctive discreet-cinematic direction; one shared semantic system prevents platform drift | `ARG-004` validation fails or founder gives final approval and this row is promoted from provisional to approved |
| DEC-012 | 2026-07-23 | Matching is evidence-informed candidate discovery with human judgment, not a predictive compatibility score | Current relationship research does not support reliable pre-meeting prediction of person-specific attraction or success | Strong prospective evidence and a new legal, scientific, product, and ethics review |
| DEC-013 | 2026-07-23 | Research conversational intake as an optional structured, text, voice, or hybrid path; only applicant-approved fields become profile data | Conversation may reduce writing burden while transcript review and field approval preserve accuracy and control | Applicant research rejects the concept or approved privacy/accessibility thresholds cannot be met |
| DEC-014 | 2026-07-23 | Do not encode wealth, gender, or presumed narcissism as a persona, prompt strategy, score, or matching feature | Group-level hypotheses cannot diagnose individuals and would create biased treatment | Never for diagnosis; segment-service hypotheses may be tested neutrally with approved research |

## Proposed ADRs

| ADR | Question | Decision owner | Required by | Status |
| --- | --- | --- | --- | --- |
| ADR-001 | Modular monolith and worker boundaries | Engineering lead | Foundation scaffold | Accepted |
| ADR-002 | Web/API framework and monorepo tooling | Engineering lead | Foundation scaffold | Accepted |
| ADR-003 | Cloud, deployment, and infrastructure-as-code | Platform owner | Environment build | Proposed |
| ADR-004 | Identity provider and authorization enforcement | Security + engineering | Auth build | Proposed |
| ADR-005 | Queue and job delivery semantics | Platform owner | Worker build | Proposed |
| ADR-006 | Object storage, upload, scanning, and media access | Security + platform | Application uploads | Proposed |
| ADR-007 | Contract generation for TypeScript and Dart | API + mobile owners | First API client | Accepted |
| ADR-008 | Analytics architecture and privacy boundaries | Product + privacy | Instrumentation | Proposed |
| ADR-009 | AI provider, data policy, and evaluation harness | AI + privacy + security | AI implementation | Proposed |
| ADR-010 | Staff admin inside or separate from primary web app | Engineering + security + design | Before foundation scaffold | Proposed |
| ADR-011 | API evolution and supported-mobile compatibility | API + mobile owners | Before contract generation | Accepted |
| ADR-012 | Transactional outbox/inbox and job delivery semantics | Platform + data owners | Before worker foundation | Accepted |
| ADR-013 | Analytics event architecture and deletion behavior | Data + privacy owners | Before instrumentation | Proposed |
| ADR-014 | Server-only and client-safe package boundaries | Engineering + security | Before foundation scaffold | Accepted |
| ADR-015 | Production topology, SLOs, capacity, and scaling | Platform + security | Before staging provisioning | Proposed |
| ADR-016 | AI workflow, tool, authorization, and evaluation boundary | AI + security + privacy | Before AI implementation | Proposed |
| ADR-017 | Pilot commerce and service-contract boundary | Founder + legal + product | Before accepting payment | Proposed |
| ADR-018 | Campaign content, taxonomy, rights, and publishing | Product + privacy + design | Before campaign implementation | Proposed |
| ADR-019 | Canonical design-token format, web/Dart/Figma generation, and drift governance | Design systems + web + mobile owners | Before `ARG-118` | Proposed |
| ADR-020 | Conversational intake ASR deployment, provider, consent, source retention, and deletion boundary | Privacy + security + mobile + AI owners | Before `ARG-613` | Proposed |
| ADR-021 | Deterministic filtering, semantic retrieval, evidence bundle, human ranking, and outcome-evaluation boundary | AI + product + data + privacy owners | Before `ARG-502` or `ARG-605` | Proposed |
| ADR-022 | PostgreSQL migrations and synthetic fixture boundary | Engineering + data | Before `ARG-107` | Accepted |
