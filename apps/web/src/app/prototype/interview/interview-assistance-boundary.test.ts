import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("interview assistance boundary", () => {
  const source = readFileSync(
    fileURLToPath(new URL("./interview-assistance.tsx", import.meta.url)),
    "utf8",
  );

  it("keeps clarification and human assistance local and provider-free", () => {
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("<form");
    expect(source).toMatch(/Nobody has\s+been/);
    expect(source).toContain("does not save, submit, or send");
  });

  it("provides deterministic clarification, privacy, fallback, and exit choices", () => {
    expect(source).toContain("Clarify the question");
    expect(source).toContain("Review what to leave out");
    expect(source).toContain("How human help would work");
    expect(source).toContain("Choose another approach");
    expect(source).toContain("Continue without interview");
    expect(source).toContain("Close interview help");
  });
});
