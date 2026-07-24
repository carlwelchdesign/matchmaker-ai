import 'package:flutter/material.dart';

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
        colorScheme: const ColorScheme.dark(
          surface: Color(0xFF130F14),
          onSurface: Color(0xFFF3EEE8),
          primary: Color(0xFFC8B8C5),
          onPrimary: Color(0xFF221923),
        ),
        scaffoldBackgroundColor: const Color(0xFF130F14),
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
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'ARGENT MATCHMAKING',
                style: textTheme.labelMedium?.copyWith(
                  color: const Color(0xFFAAA1A9),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Private by design.',
                style: textTheme.displayMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: -2,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'The mobile foundation is ready. Member workflows remain '
                'behind their product, privacy, and service-design gates.',
                style: textTheme.bodyLarge?.copyWith(
                  color: const Color(0xFFCFC5CC),
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
