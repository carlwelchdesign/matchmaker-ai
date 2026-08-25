import type { InterviewQuestion } from "./interview-guide";

export type InterviewQuestionDisposition =
  "answered" | "declined" | "proposed" | "superseded";

export type InterviewQuestionRecord = {
  attempt: number;
  disposition: InterviewQuestionDisposition;
  question: InterviewQuestion;
  recordId: string;
};

export function proposeInterviewQuestion(
  records: ReadonlyArray<InterviewQuestionRecord>,
  question: InterviewQuestion,
): InterviewQuestionRecord[] {
  const attempt =
    records.filter((record) => record.question.id === question.id).length + 1;

  return [
    ...records,
    {
      attempt,
      disposition: "proposed",
      question: snapshotQuestion(question),
      recordId: `${question.id}:${attempt}`,
    },
  ];
}

export function settleInterviewQuestion(
  records: ReadonlyArray<InterviewQuestionRecord>,
  recordId: string,
  disposition: "answered" | "declined",
): InterviewQuestionRecord[] {
  const record = records.find((candidate) => candidate.recordId === recordId);
  if (!record) {
    throw new Error(`Interview question record ${recordId} does not exist`);
  }
  if (record.disposition !== "proposed") {
    throw new Error(
      `Interview question record ${recordId} is already ${record.disposition}`,
    );
  }

  return records.map((candidate) =>
    candidate.recordId === recordId ? { ...candidate, disposition } : candidate,
  );
}

export function reopenInterviewQuestion(
  records: ReadonlyArray<InterviewQuestionRecord>,
  question: InterviewQuestion,
  supersededQuestionIds: ReadonlySet<string>,
): InterviewQuestionRecord[] {
  const supersededRecords = records.map((record) =>
    supersededQuestionIds.has(record.question.id) &&
    record.disposition !== "superseded"
      ? { ...record, disposition: "superseded" as const }
      : record,
  );

  return proposeInterviewQuestion(supersededRecords, question);
}

function snapshotQuestion(question: InterviewQuestion): InterviewQuestion {
  return {
    ...question,
    selection: {
      ...question.selection,
      sourceReferences: question.selection.sourceReferences.map(
        (reference) => ({ ...reference }),
      ),
    },
  };
}
