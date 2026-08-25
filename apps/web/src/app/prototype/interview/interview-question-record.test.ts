import { describe, expect, it } from "vitest";

import { getInterviewQuestion, type InterviewAnswer } from "./interview-guide";
import {
  getInterviewUsageExecutions,
  proposeInterviewQuestion,
  reopenInterviewQuestion,
  settleInterviewQuestion,
} from "./interview-question-record";

const proposalContext = {
  mode: "conversation" as const,
  proposedAt: "2026-08-25T18:15:00.000Z",
  sessionId: "local-interview-preview",
};

function requireQuestion(index: number, answers: InterviewAnswer[] = []) {
  const question = getInterviewQuestion(index, answers);
  if (!question) throw new Error(`Missing interview question ${index}`);
  return question;
}

describe("interview question records", () => {
  it("snapshots every required planner field when a question is proposed", () => {
    const [record] = proposeInterviewQuestion(
      [],
      requireQuestion(0),
      proposalContext,
    );

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
      usage: {
        estimatedCostMicrousd: 0,
        executionId: "question-intentions-attempt-1",
        executionKind: "deterministic-template",
        mode: "typed-conversation",
        model: null,
        provider: null,
        sessionId: "local-interview-preview",
        sourceContentStored: false,
      },
    });
  });

  it("settles only a proposed record and preserves the prior state", () => {
    const proposed = proposeInterviewQuestion(
      [],
      requireQuestion(0),
      proposalContext,
    );
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
    const proposed = proposeInterviewQuestion(
      [],
      requireQuestion(1, [answer]),
      proposalContext,
    );
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
    let records = proposeInterviewQuestion(
      [],
      requireQuestion(0),
      proposalContext,
    );
    records = settleInterviewQuestion(records, "intentions:1", "answered");
    records = proposeInterviewQuestion(
      records,
      requireQuestion(1),
      proposalContext,
    );
    records = settleInterviewQuestion(records, "pace:1", "answered");

    const reopened = reopenInterviewQuestion(
      records,
      requireQuestion(0),
      new Set(["intentions", "pace"]),
      { ...proposalContext, proposedAt: "2026-08-25T18:16:00.000Z" },
    );

    expect(
      reopened.map(({ disposition, recordId }) => ({ disposition, recordId })),
    ).toEqual([
      { disposition: "superseded", recordId: "intentions:1" },
      { disposition: "superseded", recordId: "pace:1" },
      { disposition: "proposed", recordId: "intentions:2" },
    ]);
    expect(
      getInterviewUsageExecutions(reopened).map(
        ({ executionId }) => executionId,
      ),
    ).toEqual([
      "question-intentions-attempt-1",
      "question-pace-attempt-1",
      "question-intentions-attempt-2",
    ]);
    expect(JSON.stringify(getInterviewUsageExecutions(reopened))).not.toContain(
      "An intentional beginning would suit me.",
    );
  });

  it("records hybrid planning separately and rejects duplicate usage IDs", () => {
    const records = proposeInterviewQuestion([], requireQuestion(0), {
      ...proposalContext,
      mode: "guided",
    });
    expect(records[0]?.usage.mode).toBe("hybrid");

    const duplicate = {
      ...records[0]!,
      recordId: "intentions:duplicate",
    };
    expect(() => getInterviewUsageExecutions([...records, duplicate])).toThrow(
      "duplicate executions",
    );
  });

  it("rejects a transition for an unknown record", () => {
    expect(() => settleInterviewQuestion([], "missing:1", "answered")).toThrow(
      "does not exist",
    );
  });
});
