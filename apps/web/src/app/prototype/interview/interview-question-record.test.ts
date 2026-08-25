import { describe, expect, it } from "vitest";

import { getInterviewQuestion, type InterviewAnswer } from "./interview-guide";
import {
  proposeInterviewQuestion,
  reopenInterviewQuestion,
  settleInterviewQuestion,
} from "./interview-question-record";

function requireQuestion(index: number, answers: InterviewAnswer[] = []) {
  const question = getInterviewQuestion(index, answers);
  if (!question) throw new Error(`Missing interview question ${index}`);
  return question;
}

describe("interview question records", () => {
  it("snapshots every required planner field when a question is proposed", () => {
    const [record] = proposeInterviewQuestion([], requireQuestion(0));

    expect(record).toMatchObject({
      attempt: 1,
      disposition: "proposed",
      question: {
        id: "intentions",
        prompt:
          "When you imagine a relationship worth making room for now, what feels most important?",
        selection: {
          guideVersion: "argent-text-guide-2026-08-25",
          model: null,
          plannerVersion: "argent-template-planner-2026-08-25",
          reasonCode: "required-core",
          sourceReferences: [],
        },
      },
      recordId: "intentions:1",
    });
  });

  it("settles only a proposed record and preserves the prior state", () => {
    const proposed = proposeInterviewQuestion([], requireQuestion(0));
    const answered = settleInterviewQuestion(
      proposed,
      "intentions:1",
      "answered",
    );

    expect(proposed[0]?.disposition).toBe("proposed");
    expect(answered[0]?.disposition).toBe("answered");
    expect(() =>
      settleInterviewQuestion(answered, "intentions:1", "declined"),
    ).toThrow("is already answered");
  });

  it("records an exact source reference before settling a declined follow-up", () => {
    const answer: InterviewAnswer = {
      planningPermission: "candidate-confirmed",
      questionId: "intentions",
      revision: 3,
      sourceText: "An intentional beginning would suit me.",
      topic: "relationship-intention",
    };
    const proposed = proposeInterviewQuestion([], requireQuestion(1, [answer]));
    const declined = settleInterviewQuestion(proposed, "pace:1", "declined");

    expect(declined[0]).toMatchObject({
      disposition: "declined",
      question: {
        selection: {
          model: null,
          reasonCode: "source-grounded-pace",
          sourceReferences: [{ questionId: "intentions", responseRevision: 3 }],
        },
      },
    });
  });

  it("supersedes downstream history and opens a new attempt when editing", () => {
    let records = proposeInterviewQuestion([], requireQuestion(0));
    records = settleInterviewQuestion(records, "intentions:1", "answered");
    records = proposeInterviewQuestion(records, requireQuestion(1));
    records = settleInterviewQuestion(records, "pace:1", "answered");

    const reopened = reopenInterviewQuestion(
      records,
      requireQuestion(0),
      new Set(["intentions", "pace"]),
    );

    expect(
      reopened.map(({ disposition, recordId }) => ({ disposition, recordId })),
    ).toEqual([
      { disposition: "superseded", recordId: "intentions:1" },
      { disposition: "superseded", recordId: "pace:1" },
      { disposition: "proposed", recordId: "intentions:2" },
    ]);
  });

  it("rejects a transition for an unknown record", () => {
    expect(() => settleInterviewQuestion([], "missing:1", "answered")).toThrow(
      "does not exist",
    );
  });
});
