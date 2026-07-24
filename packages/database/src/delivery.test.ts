import { describe, expect, it } from "vitest";

import {
  canonicalJson,
  DeliveryValidationError,
  jsonSha256,
} from "./delivery.js";

describe("delivery payload identity", () => {
  it("is stable across object key order", () => {
    const left = { beta: 2, alpha: { delta: true, charlie: "value" } };
    const right = { alpha: { charlie: "value", delta: true }, beta: 2 };

    expect(canonicalJson(left)).toBe(canonicalJson(right));
    expect(jsonSha256(left)).toBe(jsonSha256(right));
  });

  it("preserves array order", () => {
    expect(jsonSha256({ values: ["first", "second"] })).not.toBe(
      jsonSha256({ values: ["second", "first"] }),
    );
  });

  it("rejects non-finite JSON numbers", () => {
    expect(() => canonicalJson({ unsafe: Number.NaN })).toThrow(
      DeliveryValidationError,
    );
  });
});
