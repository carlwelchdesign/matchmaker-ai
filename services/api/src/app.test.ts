import { afterEach, describe, expect, it } from "vitest";

import { buildApiApp } from "./app.js";

const apps: ReturnType<typeof buildApiApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("API liveness", () => {
  it("returns the stable service health shape", async () => {
    const app = buildApiApp({ version: "test-version" });
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
    const app = buildApiApp();
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/internal/secrets",
    });

    expect(response.statusCode).toBe(404);
  });
});
