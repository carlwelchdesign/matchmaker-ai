import 'package:argent_api_client/argent_api_client.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('generated Dart client preserves liveness fields', () {
    final health = ServiceHealth(
      (builder) => builder
        ..service = 'argent-api'
        ..state = ServiceHealthStateEnum.ok
        ..version = 'contract-test',
    );

    expect(health.service, 'argent-api');
    expect(health.state, ServiceHealthStateEnum.ok);
    expect(health.version, 'contract-test');
  });
}
