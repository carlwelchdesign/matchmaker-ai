import { describe, expect, it } from "vitest";

import { getStructuredInterviewQuestions } from "./interview-guide";
import { buildStructuredAnswers } from "./structured-interview-state";

const questions = getStructuredInterviewQuestions();

describe("structured interview answers", () => {
  it("builds one source-exact answer per fixed question", () => {
    const drafts = Object.fromEntries(
      questions.map((question) => [
        question.id,
        `A considered answer about ${question.id}.`,
      ]),
    );

    const result = buildStructuredAnswers({
      declinedQuestionIds: new Set(),
      drafts,
      questions,
    });

    expect(result.errors).toEqual({});
    expect(result.answers).toHaveLength(questions.length);
    expect(result.answers[0]).toMatchObject({
      questionId: questions[0]?.id,
      revision: 1,
      sourceText: `A considered answer about ${questions[0]?.id}.`,
    });
  });

  it("keeps declined questions explicit without requiring text", () => {
    const declinedId = questions[1]?.id ?? "";
    const drafts = Object.fromEntries(
      questions.map((question) => [question.id, "A complete written answer."]),
    );

    const result = buildStructuredAnswers({
      declinedQuestionIds: new Set([declinedId]),
      drafts: { ...drafts, [declinedId]: "" },
      questions,
    });

    expect(result.errors).toEqual({});
    expect(
      result.answers.find((answer) => answer.questionId === declinedId),
    ).toMatchObject({ sourceText: "Prefer not to answer", revision: 1 });
  });

  it("returns field-specific errors for missing or too-short answers", () => {
    const result = buildStructuredAnswers({
      declinedQuestionIds: new Set(),
      drafts: Object.fromEntries(
        questions.map((question, index) => [
          question.id,
          index === 0 ? "short" : "A complete written answer.",
        ]),
      ),
      questions,
    });

    expect(result.answers).toHaveLength(questions.length - 1);
    expect(result.errors[questions[0]?.id ?? ""]).toContain(
      "Prefer not to answer",
    );
  });

  it("increments only a changed source revision", () => {
    const drafts = Object.fromEntries(
      questions.map((question) => [question.id, "A complete written answer."]),
    );
    const first = buildStructuredAnswers({
      declinedQuestionIds: new Set(),
      drafts,
      questions,
    });
    const changedId = questions[2]?.id ?? "";
    const second = buildStructuredAnswers({
      declinedQuestionIds: new Set(),
      drafts: { ...drafts, [changedId]: "A revised complete written answer." },
      previousAnswers: first.answers,
      questions,
    });

    expect(
      second.answers.find((answer) => answer.questionId === changedId)
        ?.revision,
    ).toBe(2);
    expect(second.answers[0]?.revision).toBe(1);
  });
});
