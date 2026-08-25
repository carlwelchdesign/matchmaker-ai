import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("adaptive interview prototype boundary", () => {
  it("keeps the first slice local and provider-free", () => {
    const source = ["adaptive-interview.tsx", "structured-interview.tsx"]
      .map((fileName) =>
        readFileSync(
          fileURLToPath(new URL(`./${fileName}`, import.meta.url)),
          "utf8",
        ),
      )
      .join("\n");

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
    const structuredSource = readFileSync(
      fileURLToPath(new URL("./structured-interview.tsx", import.meta.url)),
      "utf8",
    );
    expect(structuredSource).toContain("Continue without structured questions");
    expect(structuredSource).toContain("Continue to application review");
    expect(interviewSource).toContain("Continue to application review");
    expect(applicationSource).toContain("!isInterviewStep");
    expect(applicationSource).toContain(
      "hidden={usesInterviewExperience && step !== 1}",
    );
    expect(interviewSource).toContain("proposeInterviewQuestionWithinBudget");
    expect(applicationSource).toContain(
      "The conversational preview was paused by a usage control",
    );
    expect(applicationSource).toContain(
      "initialTransfer={interviewFallback ?? undefined}",
    );
  });
});
