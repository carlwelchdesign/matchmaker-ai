import 'package:flutter/material.dart';

import 'theme/argent_tokens.dart';

void main() {
  runApp(const ArgentMobileApp());
}

class ArgentMobileApp extends StatelessWidget {
  const ArgentMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Argent Matchmaking',
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          surface: ArgentTokens.semanticSurfaceCanvas,
          onSurface: ArgentTokens.semanticTextPrimary,
          primary: ArgentTokens.semanticActionPrimary,
          onPrimary: ArgentTokens.semanticActionOnPrimary,
          error: ArgentTokens.semanticStatusDanger,
          outline: ArgentTokens.semanticBorderSubtle,
        ),
        scaffoldBackgroundColor: ArgentTokens.semanticSurfaceCanvas,
      ),
      home: const FoundationScreen(),
    );
  }
}

class FoundationScreen extends StatelessWidget {
  const FoundationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ArgentTokens.primitiveSpace300),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'ARGENT MATCHMAKING',
                style: textTheme.labelMedium?.copyWith(
                  color: ArgentTokens.semanticTextMuted,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0,
                ),
              ),
              const SizedBox(height: ArgentTokens.primitiveSpace300),
              Text(
                'Private by design.',
                style: textTheme.displayMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0,
                  height: ArgentTokens.typeLineHeightDisplay,
                ),
              ),
              const SizedBox(height: ArgentTokens.primitiveSpace300),
              Text(
                'The mobile foundation is ready. Member workflows remain '
                'behind their product, privacy, and service-design gates.',
                style: textTheme.bodyLarge?.copyWith(
                  color: ArgentTokens.primitiveColorSilver200,
                  height: ArgentTokens.typeLineHeightBody,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
