import type { InterviewAnswer, InterviewQuestion } from "./interview-guide";

export type StructuredAnswerDrafts = Readonly<Record<string, string>>;

export type StructuredAnswerResult = {
  answers: InterviewAnswer[];
  errors: Record<string, string>;
};

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
