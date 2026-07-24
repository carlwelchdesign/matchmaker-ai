import 'package:argent_mobile/main.dart';
import 'package:argent_mobile/theme/argent_tokens.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders the synthetic concept prototype boundary', (
    tester,
  ) async {
    await tester.pumpWidget(const ArgentMobileApp());

    expect(find.text('ARGENT'), findsOneWidget);
    expect(find.text('A private\nintroduction.'), findsOneWidget);
    expect(find.textContaining('NOTHING IS SUBMITTED'), findsOneWidget);
    expect(
      find.byWidgetPredicate(
        (widget) =>
            widget is Image &&
            widget.image is AssetImage &&
            (widget.image as AssetImage).assetName ==
                'assets/images/nocturne-coastal-residence-hero.png',
      ),
      findsOneWidget,
    );
  });

  testWidgets('changes only local concept state', (tester) async {
    await tester.pumpWidget(const ArgentMobileApp());

    await tester.tap(find.text('Explore the application preview'));
    await tester.pump();

    expect(find.text('Nothing leaves\nthis device.'), findsOneWidget);
    expect(
      find.textContaining('no account, form submission, storage'),
      findsOneWidget,
    );

    await tester.tap(find.text('View sample review status'));
    await tester.pump();

    expect(find.text('Received for\nhuman review.'), findsOneWidget);
    expect(find.textContaining('not an admission decision'), findsOneWidget);
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
