# Content and Publishing Governance

## Scope

Admin-controlled campaign branding is versioned publishing, not an unrestricted set of editable fields.

## Versioned objects

- campaign content revision;
- brand asset;
- form schema;
- consent notice;
- message template;
- service/policy document;
- testimonial or success story;
- controlled taxonomy and option set.
- conversational question set and source-to-field mapping.

## Lifecycle

`DRAFT → IN_REVIEW → APPROVED → SCHEDULED → PUBLISHED → SUPERSEDED / WITHDRAWN`

Publishing records the approver, effective dates, locale, accessibility metadata, rights provenance, and linked campaign. A submitted application retains immutable references to everything presented at submission.

Conversational questions use the same lifecycle and retain a stable question ID, exact wording, allowed response modes, required/optional state, sensitive-data warning, mapped structured fields, locale, follow-up limits, and schema version. A model may clarify within those limits but may not invent new psychological tests or silently alter required fields.

## Controls

- Preview must match the published rendering.
- Publishing and rollback require authorized roles and audit events.
- Consent text cannot be edited through ordinary campaign-brand controls.
- Partner-provided assets require rights and expiration evidence.
- Withdrawn or expired assets are removed from future publication without corrupting historical evidence.
- Content claims use approved definitions for “elite,” “verified,” “confidential,” “accepted,” and similar trust language.

## Taxonomy governance

Profile and preference option sets require:

- stable machine ID and editable display label;
- version and owner;
- inclusive-language review;
- localization/accessibility fields;
- mapping/migration behavior when superseded;
- `prefer not to answer`, `self describe`, `unknown`, and `not applicable` where appropriate.
- a construct-register reference before an option can influence matching retrieval or explanation.
