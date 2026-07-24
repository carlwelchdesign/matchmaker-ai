import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("separate synthetic admin application", () => {
  test("keeps the owner concept local and disconnected", () => {
    const source = readFileSync(
      fileURLToPath(new URL("./page.tsx", import.meta.url)),
      "utf8",
    );

    expect(source).toContain("Owner workspace · local concept only");
    expect(source).toContain("Pricing is not connected");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("<form");
  });
});
