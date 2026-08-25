import type { InterviewBudgetFallbackReason } from "@argent/domain";

import type { InterviewAnswer, InterviewQuestion } from "./interview-guide";

export type StructuredAnswerDrafts = Readonly<Record<string, string>>;

export type StructuredAnswerResult = {
  answers: InterviewAnswer[];
  errors: Record<string, string>;
};

export type InterviewFallbackTransfer = {
  answers: readonly InterviewAnswer[];
  reason: InterviewBudgetFallbackReason | "candidate-choice";
};

export type StructuredFallbackState = {
  answers: InterviewAnswer[];
  declinedQuestionIds: Set<string>;
  drafts: Record<string, string>;
};

export function createInterviewFallbackTransfer(
  answers: ReadonlyArray<InterviewAnswer>,
  reason: InterviewFallbackTransfer["reason"],
): InterviewFallbackTransfer {
  return {
    answers: answers.map((answer) => ({ ...answer })),
    reason,
  };
}

export function buildStructuredFallbackState({
  answers,
  questions,
}: Readonly<{
  answers: ReadonlyArray<InterviewAnswer>;
  questions: ReadonlyArray<InterviewQuestion>;
}>): StructuredFallbackState {
  const questionIds = new Set(questions.map((question) => question.id));
  const answerIds = new Set<string>();
  const drafts: Record<string, string> = {};
  const declinedQuestionIds = new Set<string>();

  for (const answer of answers) {
    if (!questionIds.has(answer.questionId)) {
      throw new Error(
        `Fallback answer ${answer.questionId} is not in the guide`,
      );
    }
    if (answerIds.has(answer.questionId)) {
      throw new Error(`Fallback answer ${answer.questionId} is duplicated`);
    }
    answerIds.add(answer.questionId);

    const declined = answer.sourceText === "Prefer not to answer";
    if (declined !== (answer.planningPermission === "declined")) {
      throw new Error(
        `Fallback answer ${answer.questionId} has inconsistent permission`,
      );
    }
    if (declined) declinedQuestionIds.add(answer.questionId);
    else drafts[answer.questionId] = answer.sourceText;
  }

  return {
    answers: answers.map((answer) => ({ ...answer })),
    declinedQuestionIds,
    drafts,
  };
}

export function buildStructuredAnswers({
  declinedQuestionIds,
  drafts,
  previousAnswers = [],
  questions,
}: Readonly<{
  declinedQuestionIds: ReadonlySet<string>;
  drafts: StructuredAnswerDrafts;
  previousAnswers?: ReadonlyArray<InterviewAnswer>;
  questions: ReadonlyArray<InterviewQuestion>;
}>): StructuredAnswerResult {
  const errors: Record<string, string> = {};
  const answers = questions.flatMap((question) => {
    const sourceText = declinedQuestionIds.has(question.id)
      ? "Prefer not to answer"
      : (drafts[question.id] ?? "").trim();

    if (sourceText !== "Prefer not to answer" && sourceText.length < 8) {
      errors[question.id] =
        "Add a little more detail, or choose Prefer not to answer.";
      return [];
    }

    const previous = previousAnswers.find(
      (answer) => answer.questionId === question.id,
    );

    return [
      {
        planningPermission:
          sourceText === "Prefer not to answer"
            ? ("declined" as const)
            : ("candidate-confirmed" as const),
        questionId: question.id,
        revision:
          previous && previous.sourceText === sourceText
            ? previous.revision
            : (previous?.revision ?? 0) + 1,
        sourceText,
        topic: question.topic,
      },
    ];
  });

  return { answers, errors };
}
