import 'package:test/test.dart';
import 'package:argent_api_client/argent_api_client.dart';

/// tests for SystemApi
void main() {
  final instance = ArgentApiClient().getSystemApi();

  group(SystemApi, () {
    // Confirms that the API process can serve requests. This is not dependency readiness.
    //
    //Future<ServiceHealth> getLiveness() async
    test('test getLiveness', () async {
      // TODO
    });
  });
}
