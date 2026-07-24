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
      home: const ConceptLandingScreen(),
    );
  }
}

class ConceptLandingScreen extends StatefulWidget {
  const ConceptLandingScreen({super.key});

  @override
  State<ConceptLandingScreen> createState() => _ConceptLandingScreenState();
}

enum _ConceptView { applicationPreview, landing }

class _ConceptLandingScreenState extends State<ConceptLandingScreen> {
  var _view = _ConceptView.landing;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ArgentTokens.primitiveSpace300),
          child: _view == _ConceptView.landing
              ? _Landing(
                  onPreviewApplication: () =>
                      setState(() => _view = _ConceptView.applicationPreview),
                  textTheme: textTheme,
                )
              : _ApplicationPreview(
                  onReturn: () => setState(() => _view = _ConceptView.landing),
                  textTheme: textTheme,
                ),
        ),
      ),
    );
  }
}

class _Landing extends StatelessWidget {
  const _Landing({required this.onPreviewApplication, required this.textTheme});

  final VoidCallback onPreviewApplication;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'ARGENT',
          style: textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
            letterSpacing: 5,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace100),
        Text(
          'CONCEPT PROTOTYPE · NOTHING IS SUBMITTED',
          style: textTheme.labelSmall?.copyWith(
            color: ArgentTokens.semanticTextMuted,
            letterSpacing: 0.8,
          ),
        ),
        const Spacer(),
        Text(
          'FIRST CAMPAIGN · SANTA BARBARA COUNTY',
          style: textTheme.labelSmall?.copyWith(
            color: ArgentTokens.semanticTextMuted,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace200),
        Text(
          'A private\nintroduction.',
          style: textTheme.displayMedium?.copyWith(
            fontWeight: FontWeight.w600,
            height: ArgentTokens.typeLineHeightDisplay,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace200),
        Container(
          color: ArgentTokens.semanticActionPrimary,
          height: 2,
          width: 48,
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace300),
        Text(
          'A human-led introduction service for people who value discretion, '
          'clarity, and an unhurried beginning.',
          style: textTheme.bodyLarge?.copyWith(
            color: ArgentTokens.primitiveColorSilver200,
            height: ArgentTokens.typeLineHeightBody,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace400),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: onPreviewApplication,
            child: const Text('Explore the application preview'),
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace200),
        Text(
          'Private by design · Human reviewed · No guarantees',
          style: textTheme.labelSmall?.copyWith(
            color: ArgentTokens.semanticTextMuted,
          ),
        ),
      ],
    );
  }
}

class _ApplicationPreview extends StatelessWidget {
  const _ApplicationPreview({required this.onReturn, required this.textTheme});

  final VoidCallback onReturn;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'ARGENT',
          style: textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
            letterSpacing: 5,
          ),
        ),
        const Spacer(),
        Text(
          'APPLICATION PREVIEW · LOCAL ONLY',
          style: textTheme.labelSmall?.copyWith(
            color: ArgentTokens.semanticTextMuted,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace200),
        Text(
          'Nothing leaves\nthis device.',
          style: textTheme.displayMedium?.copyWith(
            fontWeight: FontWeight.w600,
            height: ArgentTokens.typeLineHeightDisplay,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace300),
        Text(
          'This preview demonstrates the pace and explanation of an '
          'application. It has no account, form submission, storage, or '
          'matching.',
          style: textTheme.bodyLarge?.copyWith(
            color: ArgentTokens.primitiveColorSilver200,
            height: ArgentTokens.typeLineHeightBody,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace400),
        _BoundaryPanel(textTheme: textTheme),
        const SizedBox(height: ArgentTokens.primitiveSpace300),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: onReturn,
            child: const Text('Return to campaign concept'),
          ),
        ),
        const Spacer(),
      ],
    );
  }
}

class _BoundaryPanel extends StatelessWidget {
  const _BoundaryPanel({required this.textTheme});

  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: ArgentTokens.semanticBorderSubtle),
        borderRadius: BorderRadius.circular(ArgentTokens.componentPanelRadius),
        color: ArgentTokens.semanticSurfaceRaised,
      ),
      child: Padding(
        padding: const EdgeInsets.all(ArgentTokens.primitiveSpace200),
        child: Text(
          'A future live application would give people clear review, '
          'correction, and withdrawal controls before any information is '
          'considered.',
          style: textTheme.bodyMedium?.copyWith(
            color: ArgentTokens.semanticTextSecondary,
            height: ArgentTokens.typeLineHeightBody,
          ),
        ),
      ),
    );
  }
}
