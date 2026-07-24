
# ServiceHealth


## Properties

Name | Type
------------ | -------------
`service` | string
`state` | string
`version` | string

## Example

```typescript
import type { ServiceHealth } from '@argent/api-client'

// TODO: Update the object below with actual values
const example = {
  "service": null,
  "state": null,
  "version": null,
} satisfies ServiceHealth

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ServiceHealth
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
