import 'package:argent_mobile/main.dart';
import 'package:argent_mobile/theme/argent_tokens.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders the gated foundation state', (tester) async {
    await tester.pumpWidget(const ArgentMobileApp());

    expect(find.text('ARGENT MATCHMAKING'), findsOneWidget);
    expect(find.text('Private by design.'), findsOneWidget);
    expect(
      find.textContaining('Member workflows remain behind'),
      findsOneWidget,
    );
  });

  testWidgets('uses generated Nocturne theme tokens', (tester) async {
    await tester.pumpWidget(const ArgentMobileApp());

    final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));

    expect(
      materialApp.theme?.colorScheme.surface,
      ArgentTokens.semanticSurfaceCanvas,
    );
    expect(
      materialApp.theme?.colorScheme.primary,
      ArgentTokens.semanticActionPrimary,
    );
    expect(
      materialApp.theme?.scaffoldBackgroundColor,
      ArgentTokens.semanticSurfaceCanvas,
    );
  });
}
