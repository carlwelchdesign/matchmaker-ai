import { buildServiceHealth } from "@argent/domain";
import Fastify, { type FastifyInstance } from "fastify";

export interface ApiAppOptions {
  readonly logger?: boolean;
  readonly version?: string;
}

export function buildApiApp(options: ApiAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? false,
    requestIdHeader: "x-request-id",
  });
  const version = options.version ?? "0.0.0";

  app.get("/health/live", async () =>
    buildServiceHealth("argent-api", version),
  );

  return app;
}
