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

## Lifecycle

`DRAFT → IN_REVIEW → APPROVED → SCHEDULED → PUBLISHED → SUPERSEDED / WITHDRAWN`

Publishing records the approver, effective dates, locale, accessibility metadata, rights provenance, and linked campaign. A submitted application retains immutable references to everything presented at submission.

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
