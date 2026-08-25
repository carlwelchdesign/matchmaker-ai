import { describe, expect, it } from "vitest";

import { transitionInterviewAssistance } from "./interview-assistance-state";
import {
  createHumanAssistanceRequestPreview,
  stageHumanAssistanceRequestLocally,
} from "./interview-human-assistance";
import {
  getInterviewQuestion,
  getStructuredInterviewQuestions,
  type InterviewAnswer,
} from "./interview-guide";
import { localInterviewBudgetPolicy } from "./interview-budget-policy";
import {
  proposeInterviewQuestion,
  proposeInterviewQuestionWithinBudget,
  settleInterviewQuestion,
} from "./interview-question-record";
import {
  buildStructuredFallbackState,
  createInterviewFallbackTransfer,
} from "./structured-interview-state";

const proposalContext = {
  mode: "conversation" as const,
  proposedAt: "2026-08-25T18:15:00.000Z",
  sessionId: "local-control-path-preview",
};

describe("deterministic interview control paths", () => {
  it("routes clarification and human-help staging through explicit states", () => {
    let state = transitionInterviewAssistance("closed", "open");
    state = transitionInterviewAssistance(state, "show-clarification");
    expect(state).toBe("clarification");
    state = transitionInterviewAssistance(state, "back-to-menu");
    state = transitionInterviewAssistance(state, "show-human-overview");

    expect(transitionInterviewAssistance(state, "stage-human-request")).toBe(
      "human-overview",
    );
    state = transitionInterviewAssistance(state, "preview-human-request");
    expect(state).toBe("human-preview");

    const preview = createHumanAssistanceRequestPreview(
      getStructuredInterviewQuestions()[0],
    );
    const staged = stageHumanAssistanceRequestLocally(preview);
    state = transitionInterviewAssistance(state, "stage-human-request");

    expect(state).toBe("human-staged");
    expect(staged.delivery).toEqual({
      contactedHuman: false,
      mode: "local-preview",
      sentCandidateContent: false,
      state: "staged-locally",
    });
  });

  it("preserves an explicit skip when the candidate chooses structured fallback", () => {
    const question = getInterviewQuestion(0, []);
    if (!question) throw new Error("Expected first interview question");
    const proposed = proposeInterviewQuestion([], question, proposalContext);
    const declined = settleInterviewQuestion(
      proposed,
      proposed[0]!.recordId,
      "declined",
    );
    const answer: InterviewAnswer = {
      planningPermission: "declined",
      questionId: question.id,
      revision: 1,
      sourceText: "Prefer not to answer",
      topic: question.topic,
    };
    const transfer = createInterviewFallbackTransfer(
      { answers: [answer], declinedQuestionIds: [], drafts: {} },
      "candidate-choice",
    );
    const structured = buildStructuredFallbackState({
      answers: transfer.answers,
      declinedQuestionIds: transfer.declinedQuestionIds,
      drafts: transfer.drafts,
      questions: getStructuredInterviewQuestions(),
    });

    expect(declined[0]?.disposition).toBe("declined");
    expect(transfer.reason).toBe("candidate-choice");
    expect(structured.declinedQuestionIds.has(question.id)).toBe(true);
  });

  it("keeps prior history and answers when a budget forces structured fallback", () => {
    const firstQuestion = getInterviewQuestion(0, []);
    if (!firstQuestion) throw new Error("Expected first interview question");
    const firstAnswer: InterviewAnswer = {
      planningPermission: "candidate-confirmed",
      questionId: firstQuestion.id,
      revision: 2,
      sourceText: "A thoughtful fictional answer worth preserving.",
      topic: firstQuestion.topic,
    };
    const answered = settleInterviewQuestion(
      proposeInterviewQuestion([], firstQuestion, proposalContext),
      `${firstQuestion.id}:1`,
      "answered",
    );
    const nextQuestion = getInterviewQuestion(1, [firstAnswer]);
    if (!nextQuestion) throw new Error("Expected second interview question");

    const result = proposeInterviewQuestionWithinBudget(
      answered,
      nextQuestion,
      { ...proposalContext, proposedAt: "2026-08-25T18:16:00.000Z" },
      {
        policy: { ...localInterviewBudgetPolicy, maxTurnsPerSession: 1 },
        sessionElapsedMs: 60_000,
      },
    );
    if (result.decision.action !== "structured-fallback") {
      throw new Error("Expected structured fallback decision");
    }
    const transfer = createInterviewFallbackTransfer(
      { answers: [firstAnswer], declinedQuestionIds: [], drafts: {} },
      result.decision.reason,
    );
    const structured = buildStructuredFallbackState({
      answers: transfer.answers,
      declinedQuestionIds: transfer.declinedQuestionIds,
      drafts: transfer.drafts,
      questions: getStructuredInterviewQuestions(),
    });

    expect(result.records).toEqual(answered);
    expect(transfer.reason).toBe("turn-limit");
    expect(structured.drafts[firstQuestion.id]).toBe(firstAnswer.sourceText);
    expect(structured.answers[0]?.revision).toBe(2);
  });
});
