import { describe, expect, it } from "vitest";

import { getStructuredInterviewQuestions } from "./interview-guide";
import {
  assertHumanAssistanceRequestPreview,
  createHumanAssistanceRequestPreview,
  humanAssistanceContractVersion,
  stageHumanAssistanceRequestLocally,
} from "./interview-human-assistance";

describe("human assistance request boundary", () => {
  it("builds a versioned minimal-context preview for every approved topic", () => {
    for (const question of getStructuredInterviewQuestions()) {
      expect(createHumanAssistanceRequestPreview(question)).toEqual({
        context: {
          fieldLabel: question.fieldLabel,
          kind: "current-topic",
          questionId: question.id,
          topic: question.topic,
        },
        contractVersion: humanAssistanceContractVersion,
        excludedContext: [
          "draft-response",
          "prior-answers",
          "proposed-profile-fields",
        ],
        requestKind: "interview-help",
      });
    }
  });

  it("uses a source-free context for the structured guide", () => {
    expect(createHumanAssistanceRequestPreview()).toMatchObject({
      context: { kind: "structured-guide" },
    });
  });

  it("stages locally without contacting anyone or sending candidate content", () => {
    const staged = stageHumanAssistanceRequestLocally(
      createHumanAssistanceRequestPreview(getStructuredInterviewQuestions()[0]),
    );

    expect(staged.delivery).toEqual({
      contactedHuman: false,
      mode: "local-preview",
      sentCandidateContent: false,
      state: "staged-locally",
    });
    expect(JSON.stringify(staged)).not.toContain("candidate answer");
  });

  it("rejects extra content and mismatched topic mappings", () => {
    const preview = createHumanAssistanceRequestPreview(
      getStructuredInterviewQuestions()[0],
    );

    expect(() =>
      assertHumanAssistanceRequestPreview({
        ...preview,
        draftResponse: "candidate answer",
      }),
    ).toThrow("unexpected fields");
    expect(() =>
      assertHumanAssistanceRequestPreview({
        ...preview,
        context: { ...preview.context, fieldLabel: "Compatibility score" },
      }),
    ).toThrow("mapping drift");
  });
});
