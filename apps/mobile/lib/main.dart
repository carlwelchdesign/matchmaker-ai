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

class FoundationScreen extends StatefulWidget {
  const FoundationScreen({super.key});

  @override
  State<FoundationScreen> createState() => _FoundationScreenState();
}

class _FoundationScreenState extends State<FoundationScreen> {
  var _step = 0;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ArgentTokens.primitiveSpace300),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ARGENT MATCHMAKING',
                style: textTheme.labelMedium?.copyWith(
                  color: ArgentTokens.semanticTextMuted,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0,
                ),
              ),
              const SizedBox(height: ArgentTokens.primitiveSpace100),
              Text(
                'CONCEPT PROTOTYPE · NO INFORMATION IS SUBMITTED',
                style: textTheme.labelSmall?.copyWith(
                  color: ArgentTokens.semanticTextMuted,
                  letterSpacing: 0.5,
                ),
              ),
              const Spacer(),
              Text(
                _step == 0
                    ? 'A more considered way to begin.'
                    : 'Nothing leaves this device.',
                style: textTheme.displayMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0,
                  height: ArgentTokens.typeLineHeightDisplay,
                ),
              ),
              const SizedBox(height: ArgentTokens.primitiveSpace300),
              Text(
                _step == 0
                    ? 'Santa Barbara County is Argent’s first controlled test '
                        'ground—not a boundary on who Argent may serve.'
                    : 'This application preview demonstrates pacing and review. '
                        'It has no account, form submission, storage, or matching.',
                style: textTheme.bodyLarge?.copyWith(
                  color: ArgentTokens.primitiveColorSilver200,
                  height: ArgentTokens.typeLineHeightBody,
                ),
              ),
              const SizedBox(height: ArgentTokens.primitiveSpace400),
              DecoratedBox(
                decoration: BoxDecoration(
                  border: Border.all(color: ArgentTokens.semanticBorderSubtle),
                  borderRadius: BorderRadius.circular(
                    ArgentTokens.componentPanelRadius,
                  ),
                  color: ArgentTokens.semanticSurfaceRaised,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(ArgentTokens.primitiveSpace200),
                  child: Text(
                    _step == 0
                        ? 'Human review, a deliberate conversation, and no '
                            'guarantee of admission or introduction.'
                        : 'A future live application would give people clear '
                            'review, correction, and withdrawal controls.',
                    style: textTheme.bodyMedium?.copyWith(
                      color: ArgentTokens.semanticTextSecondary,
                      height: ArgentTokens.typeLineHeightBody,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: ArgentTokens.primitiveSpace300),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => setState(() => _step = _step == 0 ? 1 : 0),
                  child: Text(
                    _step == 0
                        ? 'Preview application posture'
                        : 'Return to campaign concept',
                  ),
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
