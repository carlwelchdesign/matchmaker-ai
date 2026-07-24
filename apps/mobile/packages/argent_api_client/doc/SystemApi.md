# argent_api_client.api.SystemApi

## Load the API package
```dart
import 'package:argent_api_client/api.dart';
```

All URIs are relative to *http://localhost:3001*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getLiveness**](SystemApi.md#getliveness) | **GET** /health/live |


# **getLiveness**
> ServiceHealth getLiveness()



Confirms that the API process can serve requests. This is not dependency readiness.

### Example
```dart
import 'package:argent_api_client/api.dart';

final api = ArgentApiClient().getSystemApi();

try {
    final response = api.getLiveness();
    print(response);
} on DioException catch (e) {
    print('Exception when calling SystemApi->getLiveness: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ServiceHealth**](ServiceHealth.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
