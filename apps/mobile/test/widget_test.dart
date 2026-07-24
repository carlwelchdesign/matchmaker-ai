import 'package:argent_mobile/main.dart';
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
}
