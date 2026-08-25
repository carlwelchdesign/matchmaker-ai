import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("adaptive interview prototype boundary", () => {
  it("keeps the first slice local and provider-free", () => {
    const source = readFileSync(
      fileURLToPath(new URL("./adaptive-interview.tsx", import.meta.url)),
      "utf8",
    );

    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("MediaRecorder");
    expect(source).not.toContain("getUserMedia");
    expect(source).not.toContain("<form");
    expect(source).toContain("nothing is submitted, persisted, or sent");
    expect(source).toContain("use fictional details only");
  });
});
