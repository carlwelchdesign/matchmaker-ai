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

enum _ConceptView { applicationPreview, landing, status }

class _ConceptLandingScreenState extends State<ConceptLandingScreen> {
  var _view = _ConceptView.landing;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: _view == _ConceptView.landing
            ? _Landing(
                onPreviewApplication: () =>
                    setState(() => _view = _ConceptView.applicationPreview),
                textTheme: textTheme,
              )
            : Padding(
                padding: const EdgeInsets.all(ArgentTokens.primitiveSpace300),
                child: _view == _ConceptView.applicationPreview
                    ? _ApplicationPreview(
                        onReturn: () =>
                            setState(() => _view = _ConceptView.landing),
                        onViewStatus: () =>
                            setState(() => _view = _ConceptView.status),
                        textTheme: textTheme,
                      )
                    : _StatusMoment(
                        onReturn: () =>
                            setState(() => _view = _ConceptView.landing),
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
    return ClipRect(
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/nocturne-coastal-residence-hero.png',
            alignment: Alignment.centerRight,
            fit: BoxFit.cover,
            semanticLabel: 'Coastal residence at blue hour',
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Color(0xF00F1014),
                  Color(0xC20F1014),
                  Color(0x240F1014),
                ],
                stops: [0, 0.52, 1],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(ArgentTokens.primitiveSpace300),
            child: Column(
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
                  'A human-led introduction service for people who value '
                  'discretion, clarity, and an unhurried beginning.',
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
            ),
          ),
        ],
      ),
    );
  }
}

class _ApplicationPreview extends StatelessWidget {
  const _ApplicationPreview({
    required this.onReturn,
    required this.onViewStatus,
    required this.textTheme,
  });

  final VoidCallback onReturn;
  final VoidCallback onViewStatus;
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
          child: FilledButton(
            onPressed: onViewStatus,
            child: const Text('View sample review status'),
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace150),
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

class _StatusMoment extends StatelessWidget {
  const _StatusMoment({required this.onReturn, required this.textTheme});

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
          'SAMPLE STATUS · LOCAL ONLY',
          style: textTheme.labelSmall?.copyWith(
            color: ArgentTokens.semanticTextMuted,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace200),
        Text(
          'Received for\nhuman review.',
          style: textTheme.displayMedium?.copyWith(
            fontWeight: FontWeight.w600,
            height: ArgentTokens.typeLineHeightDisplay,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace300),
        _BoundaryPanel(
          textTheme: textTheme,
          text:
              'This is a sample status only. It is not an admission decision, '
              'a verification result, or a promise of an introduction.',
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace300),
        Text(
          'In a live service, a person would see what happens next, who can '
          'review their information, and how to correct or withdraw it.',
          style: textTheme.bodyMedium?.copyWith(
            color: ArgentTokens.semanticTextSecondary,
            height: ArgentTokens.typeLineHeightBody,
          ),
        ),
        const SizedBox(height: ArgentTokens.primitiveSpace400),
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
  const _BoundaryPanel({
    required this.textTheme,
    this.text =
        'A future live application would give people clear review, '
        'correction, and withdrawal controls before any information is '
        'considered.',
  });

  final TextTheme textTheme;
  final String text;

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
          text,
          style: textTheme.bodyMedium?.copyWith(
            color: ArgentTokens.semanticTextSecondary,
            height: ArgentTokens.typeLineHeightBody,
          ),
        ),
      ),
    );
  }
}
