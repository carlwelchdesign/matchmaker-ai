# Design system

The canonical Nocturne tokens and generated web/Dart adapters are owned by `ARG-118`.

## Editing workflow

1. Edit `tokens/nocturne.tokens.json`.
2. Run `pnpm --filter @argent/design-system generate`.
3. Commit the generated web and Dart adapters with the token source.

Generated files are intentionally checked in so web and Flutter can consume the same reviewed token decisions without requiring runtime token parsing.

## Outputs

- `generated/web/nocturne.css` exposes CSS custom properties for the web app.
- `generated/dart/argent_tokens.dart` is the package-level Flutter adapter.
- `apps/mobile/lib/theme/argent_tokens.dart` is the mobile app copy used by Flutter.

The source uses human-readable dot-notation names grouped as primitive, semantic, component, layout, and type tokens. Product code should consume semantic or component tokens whenever a role exists.
