# Argent Cross-Platform Design System

## Status

**Selected direction, approval pending.**

The founder selected visual exploration `02`, now named **Nocturne**, for further development. Nocturne is the required direction for Argent public web, applicant/member web, staff web, iOS, and Android. This selection replaces the earlier ivory/forest concept set, but it does not complete `ARG-004`; final brand approval requires the evidence and checks below.

The current reference is [the Nocturne system specimen](visuals/nocturne-system-specimen.png).

## Design thesis

Argent should feel like a discreet private advisory service supported by excellent technology. Nocturne expresses that through cinematic framing, strong typography, restrained color, and calm operational clarity.

- Near-black aubergine and smoked-plum surfaces replace generic pure black.
- Parchment white and muted silver provide readable foregrounds.
- Oxblood is reserved for primary action and meaningful emphasis.
- Condensed display typography creates identity; a humanist sans carries interface and body copy.
- Monospaced labels are limited to metadata and operational context.
- Asymmetric grids, hairline separators, and restrained corner radii replace generic card grids.
- Photography is private, dignified, and editorial—not seductive, theatrical, or public-profile-like.
- Staff surfaces may use a lighter smoked-plum density mode while retaining the same semantic tokens and component grammar.

Luxury is demonstrated through discretion, service, curation, and craft—not gold, exclusivity theater, or ornamental decoration.

## One system across web, iOS, and Android

The platforms share the same semantic vocabulary and component intent. They do not require pixel-identical rendering.

| Layer | Canonical responsibility | Web output | Flutter output | Design output |
| --- | --- | --- | --- | --- |
| Primitive tokens | Raw color, type, size, and duration values | Generated CSS variables | Generated Dart constants | Figma variables |
| Semantic tokens | Meaning such as canvas, text, action, focus, and danger | Theme variables | `ThemeData` and `ThemeExtension` values | Semantic variable collection |
| Component tokens | Intent for buttons, inputs, panels, navigation, and status | Component styles | Flutter component themes | Component properties and variants |
| Platform adaptation | Native behavior, density, safe areas, and interaction conventions | Responsive web rules | Cupertino/Material-aware composition | Platform-specific component examples |

The canonical source should use a vendor-neutral, human-readable token file compatible with the Design Tokens Community Group format. Code generation must produce web, Dart, and Figma-consumable artifacts. Generated outputs are not hand-edited.

## Token architecture

Tokens use lowercase dot notation. Names describe role, not appearance.

```text
primitive.color.aubergine.950
primitive.color.plum.800
primitive.color.parchment.050
primitive.color.silver.300
primitive.color.oxblood.600

surface.canvas
surface.raised
surface.overlay
text.primary
text.muted
text.inverse
border.subtle
border.strong
action.primary
action.primary.hover
focus.ring
status.success
status.warning
status.danger

space.100
space.200
space.300
space.400
space.600

type.display.hero
type.heading.section
type.body.default
type.body.compact
type.label.meta

radius.control
radius.panel
border.width.hairline
motion.fast
motion.standard
layout.content.standard
layout.content.wide
layout.gutter.compact
layout.gutter.expanded
```

Components consume semantic or component tokens. A component must not directly consume a primitive when an appropriate semantic role exists.

## Required token groups

- Color primitives and semantic color roles
- Typography families, weights, sizes, line heights, and tracking
- Spacing and sizing on an 8px base with documented 4px exceptions
- Layout grids, content widths, gutters, and responsive breakpoints
- Border widths, separators, focus rings, and corner radii
- Elevation and overlays used only where hierarchy requires them
- Motion durations, easing, reduced-motion behavior, and transition purpose
- Z-index/layer roles
- Icon size and stroke roles
- Data-density and touch-target rules

Token values remain provisional until contrast, real-content, device, and component-state validation is complete.

## Semantic modes

Nocturne supports two semantic modes without becoming two visual brands:

### Immersive

Used for public campaigns, selective intake moments, and accepted-member introduction experiences. It allows cinematic imagery, larger typography, and more negative space.

### Operational

Used for matchmaker and administrator workflows. It increases information density, reduces decorative imagery, strengthens separators, and preserves readable work surfaces for long sessions.

Both modes use the same token names. Mode-specific values are resolved by the theme layer.

## Foundational components

`ARG-118` owns the initial cross-platform foundations:

- typography styles;
- buttons and icon buttons;
- text fields, selects, checkboxes, radio controls, and switches;
- links and navigation;
- panels and structured sections;
- status labels;
- dialogs, drawers, sheets, and alerts;
- loading, empty, error, offline, and permission-denied states;
- focus, hover, pressed, selected, disabled, and destructive states;
- responsive page shell and operational workspace shell.

Public, staff, and member product tickets should compose these foundations rather than introduce one-off styling.

## Platform rules

### Web

- Use semantic CSS variables generated from the canonical tokens.
- Public and operational surfaces share foundations but may select different semantic modes.
- Support keyboard navigation, visible focus, text zoom, reflow, and responsive layouts from narrow mobile web through wide staff workstations.

### iOS and Android

- Consume generated Dart tokens through `ThemeData` and typed theme extensions.
- Respect platform navigation, back behavior, safe areas, input conventions, dynamic type/font scaling, and accessibility semantics.
- A shared Flutter component may adapt behavior by platform while preserving Argent’s hierarchy, tokens, and content intent.
- Do not force web interaction patterns into native mobile controls.

## Accessibility and trust requirements

- WCAG 2.2 AA is the minimum target for web; equivalent platform accessibility expectations apply to Flutter.
- Text and interactive contrast must be measured, not judged from mockups.
- Oxblood cannot be the sole carrier of status or error meaning.
- Touch targets, keyboard focus, screen-reader labels, dynamic text, reduced motion, and error recovery are required.
- Cinematic surfaces must not reduce copy readability or obscure consent, privacy, status, or consequence language.
- AI suggestions must show human-review state, rationale, uncertainty, and reversible actions without opaque compatibility scores.

## Anti-template guardrails

- No cream-and-forest luxury palette.
- No gold-on-black VIP treatment.
- No centered editorial-serif hero as a default composition.
- No generic grid of rounded dashboard cards.
- No pill-heavy interface or decorative glassmorphism.
- No hearts, swiping, compatibility percentages, public popularity, or dating-app gamification.
- No arbitrary color, radius, spacing, shadow, or motion values.
- No new component without required states and responsive behavior.
- No platform-specific redesign that silently forks the Argent brand.

## Governance

- `plans/design-system.md` defines design intent and governance.
- The canonical token source in `packages/design-system/` will define approved values after `ARG-118`.
- Figma variables and component definitions must map to canonical token names.
- CI should reject unapproved token drift, stale generated outputs, and direct primitive use where a semantic alias exists.
- New tokens require a documented use case, owner, affected platforms, accessibility impact, and migration plan.
- Deprecations must retain aliases through an announced migration window.
- Campaign branding may supply approved assets and constrained theme choices; it cannot override accessibility, consent, security, or core Argent interaction rules.

## `ARG-004` approval gate

Nocturne may move from selected to approved only when:

- [ ] Founder approves the system specimen and representative public, member, and matchmaker views.
- [ ] Public web, operational web, iOS, and Android use cases are represented.
- [ ] Primitive, semantic, component, layout, motion, and platform token groups are specified.
- [ ] Color contrast is measured for common and critical states.
- [ ] Typography is validated with real content, text scaling, and long labels.
- [ ] Keyboard, focus, touch-target, screen-reader, and reduced-motion expectations are documented.
- [ ] Loading, empty, error, offline, permission-denied, disabled, and destructive states are represented.
- [ ] Campaign co-branding is shown without weakening Argent ownership.
- [ ] Matchmaker workflows are tested for density and extended-use readability.
- [ ] Accepted-member mobile flows preserve privacy and separate consent.
- [ ] At least one representative view is reviewed at web, iOS, and Android breakpoints.
- [ ] Anti-template guardrails are accepted.

Final approval closes `ARG-004`. Implementation begins under `ARG-118` and the linked platform tickets.
