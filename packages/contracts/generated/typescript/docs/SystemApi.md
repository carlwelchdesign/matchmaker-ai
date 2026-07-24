# SystemApi

All URIs are relative to *http://localhost:3001*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getLiveness**](SystemApi.md#getliveness) | **GET** /health/live |  |



## getLiveness

> ServiceHealth getLiveness()



Confirms that the API process can serve requests. This is not dependency readiness.

### Example

```ts
import {
  Configuration,
  SystemApi,
} from '@argent/api-client';
import type { GetLivenessRequest } from '@argent/api-client';

async function example() {
  console.log("🚀 Testing @argent/api-client SDK...");
  const api = new SystemApi();

  try {
    const data = await api.getLiveness();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ServiceHealth**](ServiceHealth.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Default Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
