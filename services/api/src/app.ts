import { buildServiceHealth } from "@argent/domain";
import swagger from "@fastify/swagger";
import Fastify, { type FastifyInstance } from "fastify";

export interface ApiAppOptions {
  readonly logger?: boolean;
  readonly version?: string;
}

export async function buildApiApp(
  options: ApiAppOptions = {},
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    requestIdHeader: "x-request-id",
  });
  const version = options.version ?? "0.0.0";

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Argent API",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3001" }],
    },
    refResolver: {
      buildLocalReference(json) {
        return typeof json.$id === "string" ? json.$id : "AnonymousSchema";
      },
    },
  });

  app.addSchema({
    $id: "ServiceHealth",
    additionalProperties: false,
    properties: {
      service: { type: "string" },
      state: { enum: ["ok", "degraded"], type: "string" },
      version: { type: "string" },
    },
    required: ["service", "state", "version"],
    type: "object",
  });

  app.get(
    "/health/live",
    {
      schema: {
        description:
          "Confirms that the API process can serve requests. This is not dependency readiness.",
        operationId: "getLiveness",
        response: {
          200: { $ref: "ServiceHealth#" },
        },
        tags: ["System"],
      },
    },
    async () => buildServiceHealth("argent-api", version),
  );

  return app;
}
