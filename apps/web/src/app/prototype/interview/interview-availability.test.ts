import { describe, expect, it } from "vitest";

import type { InterviewAnswer } from "./interview-guide";
import { resolveInterviewAvailabilityTransition } from "./interview-availability";

const answer: InterviewAnswer = {
  planningPermission: "candidate-confirmed",
  questionId: "intentions",
  revision: 2,
  sourceText: "A thoughtful fictional answer worth preserving.",
  topic: "relationship-intention",
};

describe("interview availability transition", () => {
  it("routes an on-to-off transition to the structured guide", () => {
    expect(
      resolveInterviewAvailabilityTransition({
        interviewEnabled: false,
        progress: {
          answers: [answer],
          declinedQuestionIds: ["practical-preferences"],
          drafts: { intentions: "An unfinished local draft." },
        },
        previouslyEnabled: true,
      }),
    ).toEqual({
      action: "structured-fallback",
      transfer: {
        answers: [answer],
        declinedQuestionIds: ["practical-preferences"],
        drafts: { intentions: "An unfinished local draft." },
        reason: "feature-kill-switch",
      },
    });
  });

  it.each([
    { interviewEnabled: false, previouslyEnabled: false },
    { interviewEnabled: true, previouslyEnabled: false },
    { interviewEnabled: true, previouslyEnabled: true },
  ])(
    "does not invent a transition for enabled=$interviewEnabled previous=$previouslyEnabled",
    ({ interviewEnabled, previouslyEnabled }) => {
      expect(
        resolveInterviewAvailabilityTransition({
          interviewEnabled,
          progress: {
            answers: [answer],
            declinedQuestionIds: [],
            drafts: {},
          },
          previouslyEnabled,
        }),
      ).toEqual({ action: "continue" });
    },
  );

  it("snapshots progress so later mutation cannot alter the fallback", () => {
    const mutableAnswer = { ...answer };
    const mutableDrafts = { intentions: "Original draft" };
    const mutableDeclines = ["practical-preferences"];
    const result = resolveInterviewAvailabilityTransition({
      interviewEnabled: false,
      progress: {
        answers: [mutableAnswer],
        declinedQuestionIds: mutableDeclines,
        drafts: mutableDrafts,
      },
      previouslyEnabled: true,
    });
    mutableAnswer.sourceText = "Changed after transition";
    mutableDrafts.intentions = "Changed after transition";
    mutableDeclines.push("relationship-style");

    expect(result.action).toBe("structured-fallback");
    if (result.action !== "structured-fallback") return;
    expect(result.transfer.answers[0]?.sourceText).toBe(answer.sourceText);
    expect(result.transfer.drafts.intentions).toBe("Original draft");
    expect(result.transfer.declinedQuestionIds).toEqual([
      "practical-preferences",
    ]);
  });
});
