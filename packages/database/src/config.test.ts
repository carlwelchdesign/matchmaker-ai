import { describe, expect, it } from "vitest";

import {
  assertSyntheticSeedAllowed,
  DatabaseConfigurationError,
  parseSeedEnvironment,
  requireDatabaseUrl,
} from "./config.js";

describe("database configuration", () => {
  it("accepts an explicit PostgreSQL URL without rewriting it", () => {
    const value = "postgresql://argent:secret@127.0.0.1:5432/argent";

    expect(requireDatabaseUrl(value)).toBe(value);
  });

  it.each([
    undefined,
    "",
    "not-a-url",
    "https://example.com/database",
    "postgresql://127.0.0.1/argent",
    "postgresql://argent@127.0.0.1",
  ])("rejects incomplete or unsafe database configuration", (value) => {
    expect(() => requireDatabaseUrl(value)).toThrow(DatabaseConfigurationError);
  });

  it.each(["local", "test", "staging", "production"] as const)(
    "recognizes the %s environment",
    (environment) => {
      expect(parseSeedEnvironment(environment)).toBe(environment);
    },
  );

  it("rejects an unspecified environment", () => {
    expect(() => parseSeedEnvironment(undefined)).toThrow(
      DatabaseConfigurationError,
    );
  });

  it("allows local and test synthetic fixtures", () => {
    expect(() => assertSyntheticSeedAllowed("local")).not.toThrow();
    expect(() => assertSyntheticSeedAllowed("test")).not.toThrow();
  });

  it("requires explicit staging approval and always refuses production", () => {
    expect(() => assertSyntheticSeedAllowed("staging")).toThrow(
      "ALLOW_SYNTHETIC_SEED=true",
    );
    expect(() => assertSyntheticSeedAllowed("staging", "true")).not.toThrow();
    expect(() => assertSyntheticSeedAllowed("production", "true")).toThrow(
      "never allowed in production",
    );
  });
});
