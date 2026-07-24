import { describe, expect, it } from "vitest";

import {
  canonicalJson,
  DeliveryValidationError,
  jsonSha256,
  type JsonObject,
} from "./delivery.js";

describe("delivery payload identity", () => {
  it("is stable across object key order", () => {
    const left = { beta: 2, alpha: { delta: true, charlie: "value" } };
    const right = { alpha: { charlie: "value", delta: true }, beta: 2 };

    expect(canonicalJson(left)).toBe(canonicalJson(right));
    expect(jsonSha256(left)).toBe(jsonSha256(right));
  });

  it("sorts keys by deterministic Unicode code units, not host locale", () => {
    expect(canonicalJson({ "2": "two", "10": "ten", ä: 1, z: 2, Z: 3 })).toBe(
      '{"10":"ten","2":"two","Z":3,"z":2,"ä":1}',
    );
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

  it("rejects non-JSON objects instead of silently changing their meaning", () => {
    expect(() =>
      canonicalJson({
        when: new Date("2026-01-01T00:00:00.000Z"),
      } as unknown as JsonObject),
    ).toThrow(DeliveryValidationError);
  });

  it("rejects sparse arrays instead of producing invalid JSON", () => {
    const sparse: string[] = [];
    sparse[1] = "second";
    const augmented = ["first"] as string[] & { extra?: boolean };
    augmented.extra = true;

    expect(() =>
      canonicalJson({ values: sparse } as unknown as JsonObject),
    ).toThrow(DeliveryValidationError);
    expect(() =>
      canonicalJson({ values: augmented } as unknown as JsonObject),
    ).toThrow(DeliveryValidationError);
  });

  it("rejects accessors without evaluating them", () => {
    let getterEvaluated = false;
    const value = {};
    Object.defineProperty(value, "secret", {
      enumerable: true,
      get() {
        getterEvaluated = true;
        return "must-not-run";
      },
    });

    expect(() => canonicalJson(value as JsonObject)).toThrow(
      DeliveryValidationError,
    );
    expect(getterEvaluated).toBe(false);
  });

  it("rejects non-JSON primitive values", () => {
    expect(() =>
      canonicalJson({ unsafe: undefined } as unknown as JsonObject),
    ).toThrow(DeliveryValidationError);
    expect(() =>
      canonicalJson({ unsafe: 1n } as unknown as JsonObject),
    ).toThrow(DeliveryValidationError);
  });

  it("rejects cyclic and excessively deep payloads with bounded errors", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalJson(cyclic as unknown as JsonObject)).toThrow(
      DeliveryValidationError,
    );

    const deep: Record<string, unknown> = {};
    let cursor = deep;
    for (let index = 0; index <= 100; index += 1) {
      const child: Record<string, unknown> = {};
      cursor.child = child;
      cursor = child;
    }
    expect(() => canonicalJson(deep as unknown as JsonObject)).toThrow(
      DeliveryValidationError,
    );
  });
});
