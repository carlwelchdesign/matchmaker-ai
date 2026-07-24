# Contracts

`services/api` owns the HTTP route schemas. The contract workflow writes those
schemas to `openapi/argent-v1.json`, then generates:

- `generated/typescript` for TypeScript consumers.
- `apps/mobile/packages/argent_api_client` for Flutter consumers.

Do not hand-edit generated clients. Change the API schema and regenerate:

```bash
pnpm contracts:generate
```

CI runs `pnpm contracts:check` and fails if regeneration changes checked-in
artifacts. The TypeScript verification package and Flutter application each
compile and exercise their generated client.

The OpenAPI document is the client-safe transport boundary. Server domain,
authorization, provider, and private persistence modules must not be exported
through this package.
