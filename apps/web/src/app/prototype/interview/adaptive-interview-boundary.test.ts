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

  it("announces progress and moves focus across explicit stage changes", () => {
    const adaptiveSource = readFileSync(
      fileURLToPath(new URL("./adaptive-interview.tsx", import.meta.url)),
      "utf8",
    );
    const structuredSource = readFileSync(
      fileURLToPath(new URL("./structured-interview.tsx", import.meta.url)),
      "utf8",
    );

    expect(adaptiveSource).toContain('aria-live="polite"');
    expect(adaptiveSource).toContain('aria-label="Answer style"');
    expect(adaptiveSource).toContain('role="group"');
    expect(adaptiveSource).toContain("questionHeadingRef.current?.focus()");
    expect(adaptiveSource).toContain("reviewHeadingRef.current?.focus()");
    expect(structuredSource).toContain("worksheetHeadingRef.current?.focus()");
    expect(structuredSource).toContain("completeHeadingRef.current?.focus()");
  });

  it("isolates live flag refresh from candidate interview content", () => {
    const source = readFileSync(
      fileURLToPath(
        new URL("./use-interview-availability.ts", import.meta.url),
      ),
      "utf8",
    );

    expect(source).toContain("fetchInterviewAvailability");
    expect(source).toContain('document.visibilityState !== "visible"');
    expect(source).not.toContain("InterviewAnswer");
    expect(source).not.toContain("drafts");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
  });
});
