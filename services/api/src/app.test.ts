import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { buildApiApp } from "./app.js";

const apps: FastifyInstance[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("API liveness", () => {
  it("returns the stable service health shape", async () => {
    const app = await buildApiApp({ version: "test-version" });
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/health/live",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "argent-api",
      state: "ok",
      version: "test-version",
    });
  });

  it("does not expose an unknown route", async () => {
    const app = await buildApiApp();
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/internal/secrets",
    });

    expect(response.statusCode).toBe(404);
  });

  it("publishes the liveness operation in the generated contract", async () => {
    const app = await buildApiApp();
    apps.push(app);
    await app.ready();

    const contract = app.swagger();
    if (!("openapi" in contract)) {
      throw new Error("Expected an OpenAPI contract");
    }

    expect(contract.paths?.["/health/live"]?.get?.operationId).toBe(
      "getLiveness",
    );
    expect(contract.components?.schemas?.ServiceHealth).toMatchObject({
      required: ["service", "state", "version"],
      type: "object",
    });
  });
});
