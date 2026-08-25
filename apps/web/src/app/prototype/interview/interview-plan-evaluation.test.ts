import { describe, expect, it } from "vitest";

import {
  evaluateInterviewPlanRun,
  interviewPlanEvaluationThresholds,
  type InterviewPlanRun,
} from "./interview-plan-evaluation";
import {
  getInterviewQuestion,
  getInterviewQuestionCount,
  type InterviewAnswer,
  type InterviewQuestion,
} from "./interview-guide";

const groundedAnswer: InterviewAnswer = {
  questionId: "intentions",
  revision: 2,
  sourceText: "I would prefer an intentional beginning.",
  topic: "relationship-intention",
};

function getCoreQuestions(): InterviewQuestion[] {
  return Array.from({ length: getInterviewQuestionCount() }, (_, index) => {
    const question = getInterviewQuestion(index, []);
    if (!question) {
      throw new Error(`Missing guide question ${index}`);
    }
    return question;
  });
}

function replacePrompt(
  question: InterviewQuestion,
  prompt: string,
): InterviewQuestion {
  return { ...question, prompt };
}

describe("interview plan evaluation", () => {
  it("passes a complete, guide-aligned planner run", () => {
    const result = evaluateInterviewPlanRun({
      answers: [],
      status: "complete",
      turns: getCoreQuestions(),
    });

    expect(result.passed).toBe(true);
    expect(result.metrics).toEqual(interviewPlanEvaluationThresholds);
    expect(result.violations).toEqual([]);
  });

  it("rejects compound questions at a zero-tolerance threshold", () => {
    const [first, ...rest] = getCoreQuestions();
    const result = evaluateInterviewPlanRun({
      answers: [],
      status: "complete",
      turns: [
        replacePrompt(
          first,
          "What matters to you, and how would you recognize it?",
        ),
        ...rest,
      ],
    });

    expect(result.passed).toBe(false);
    expect(result.metrics.compoundQuestionRate).toBe(0.25);
    expect(result.violations).toContainEqual({
      metric: "compoundQuestionRate",
      questionId: "intentions",
      turnIndex: 0,
    });
  });

  it("rejects repeated acknowledgement language", () => {
    const questions = getCoreQuestions();
    const repeated = "Thank you for sharing. What would you like to add?";
    const result = evaluateInterviewPlanRun({
      answers: [],
      status: "complete",
      turns: [
        replacePrompt(questions[0], repeated),
        replacePrompt(questions[1], repeated),
        ...questions.slice(2),
      ],
    });

    expect(result.metrics.repetitiveAcknowledgementRate).toBe(0.25);
    expect(result.violations).toContainEqual({
      metric: "repetitiveAcknowledgementRate",
      questionId: "pace",
      turnIndex: 1,
    });
  });

  it("allows an active run but rejects completion before every core topic", () => {
    const turns = getCoreQuestions().slice(0, 2);
    const active = evaluateInterviewPlanRun({
      answers: [],
      status: "active",
      turns,
    });
    const complete = evaluateInterviewPlanRun({
      answers: [],
      status: "complete",
      turns,
    });

    expect(active.metrics.prematureTerminationCount).toBe(0);
    expect(complete.metrics.prematureTerminationCount).toBe(1);
    expect(complete.passed).toBe(false);
  });

  it("rejects a source-grounded selection without an exact answer reference", () => {
    const groundedQuestion = getInterviewQuestion(1, [groundedAnswer]);
    expect(groundedQuestion).not.toBeNull();

    const result = evaluateInterviewPlanRun({
      answers: [{ ...groundedAnswer, revision: 1 }],
      status: "active",
      turns: [groundedQuestion!],
    });

    expect(result.metrics.unsupportedInferenceCount).toBe(1);
    expect(result.violations).toContainEqual({
      metric: "unsupportedInferenceCount",
      questionId: "pace",
      turnIndex: 0,
    });
  });

  it("rejects question IDs or topics that drift outside the guide", () => {
    const [first] = getCoreQuestions();
    const drifted: InterviewQuestion = {
      ...first,
      id: "lifestyle-score",
      topic: "life-rhythm",
    };

    const result = evaluateInterviewPlanRun({
      answers: [],
      status: "active",
      turns: [drifted],
    });

    expect(result.metrics.topicDriftCount).toBe(1);
    expect(result.passed).toBe(false);
  });

  it("rejects reason codes that claim support for the wrong topic", () => {
    const groundedQuestion = getInterviewQuestion(1, [groundedAnswer]);
    expect(groundedQuestion).not.toBeNull();

    const wrongReason: InterviewQuestion = {
      ...groundedQuestion!,
      selection: {
        ...groundedQuestion!.selection,
        reasonCode: "source-grounded-rhythm",
      },
    };
    const run: InterviewPlanRun = {
      answers: [groundedAnswer],
      status: "active",
      turns: [wrongReason],
    };

    expect(
      evaluateInterviewPlanRun(run).metrics.unsupportedInferenceCount,
    ).toBe(1);
  });
});
