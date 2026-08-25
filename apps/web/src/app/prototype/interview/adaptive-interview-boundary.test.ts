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

  it("requires an explicit interview exit or reviewed continuation", () => {
    const interviewSource = readFileSync(
      fileURLToPath(new URL("./adaptive-interview.tsx", import.meta.url)),
      "utf8",
    );
    const applicationSource = readFileSync(
      fileURLToPath(new URL("../../prototype.tsx", import.meta.url)),
      "utf8",
    );

    expect(interviewSource).toContain("Choose another approach");
    expect(interviewSource).toContain("Continue without interview");
    expect(interviewSource).toContain("Continue to application review");
    expect(applicationSource).toContain("!isAdaptiveInterviewStep");
    expect(applicationSource).toContain(
      "hidden={usesAdaptiveInterview && step !== 1}",
    );
  });
});
