import 'package:argent_mobile/main.dart';
import 'package:argent_mobile/theme/argent_tokens.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders the synthetic concept prototype boundary', (tester) async {
    await tester.pumpWidget(const ArgentMobileApp());

    expect(find.text('ARGENT MATCHMAKING'), findsOneWidget);
    expect(find.text('A private introduction.'), findsOneWidget);
    expect(
      find.textContaining('NO INFORMATION IS SUBMITTED'),
      findsOneWidget,
    );
  });

  testWidgets('changes only local concept state', (tester) async {
    await tester.pumpWidget(const ArgentMobileApp());

    await tester.tap(find.text('Preview application posture'));
    await tester.pump();

    expect(find.text('Nothing leaves this device.'), findsOneWidget);
    expect(find.textContaining('no account, form submission, storage'), findsOneWidget);
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
