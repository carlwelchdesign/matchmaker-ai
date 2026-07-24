import { describe, expect, it } from "vitest";

import { buildServiceHealth } from "./health.js";

describe("buildServiceHealth", () => {
  it("normalizes a valid service identity", () => {
    expect(buildServiceHealth(" argent-api ", " 0.0.0 ")).toEqual({
      service: "argent-api",
      state: "ok",
      version: "0.0.0",
    });
  });

  it.each([
    ["", "0.0.0", "Service name must not be empty"],
    ["argent-api", " ", "Service version must not be empty"],
  ])("rejects invalid identity values", (service, version, message) => {
    expect(() => buildServiceHealth(service, version)).toThrow(message);
  });
});
