import {
  recordInterviewUsageExecution,
  type InterviewUsageExecution,
  type InterviewUsageMode,
} from "@argent/domain";

import type { InterviewMode, InterviewQuestion } from "./interview-guide";

export type InterviewQuestionDisposition =
  "answered" | "declined" | "proposed" | "superseded";

export type InterviewQuestionRecord = {
  attempt: number;
  disposition: InterviewQuestionDisposition;
  question: InterviewQuestion;
  recordId: string;
  usage: InterviewUsageExecution;
};

export type InterviewQuestionProposalContext = {
  mode: InterviewMode;
  proposedAt: string;
  sessionId: string;
};

export function proposeInterviewQuestion(
  records: ReadonlyArray<InterviewQuestionRecord>,
  question: InterviewQuestion,
  context: InterviewQuestionProposalContext,
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
      usage: createPlannerUsage(question, attempt, context),
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
  context: InterviewQuestionProposalContext,
): InterviewQuestionRecord[] {
  const supersededRecords = records.map((record) =>
    supersededQuestionIds.has(record.question.id) &&
    record.disposition !== "superseded"
      ? { ...record, disposition: "superseded" as const }
      : record,
  );

  return proposeInterviewQuestion(supersededRecords, question, context);
}

export function getInterviewUsageExecutions(
  records: ReadonlyArray<InterviewQuestionRecord>,
): ReadonlyArray<InterviewUsageExecution> {
  const executionIds = new Set(
    records.map((record) => record.usage.executionId),
  );
  if (executionIds.size !== records.length) {
    throw new Error("Interview question usage contains duplicate executions");
  }
  return records.map((record) => record.usage);
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

function createPlannerUsage(
  question: InterviewQuestion,
  attempt: number,
  context: InterviewQuestionProposalContext,
): InterviewUsageExecution {
  const mode: InterviewUsageMode =
    context.mode === "conversation" ? "typed-conversation" : "hybrid";

  return recordInterviewUsageExecution({
    audioInputMs: 0,
    audioOutputMs: 0,
    cacheBehavior: "none",
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    environment: "development",
    estimatedCostMicrousd: 0,
    executionId: `question-${question.id}-attempt-${attempt}`,
    executionKind: "deterministic-template",
    inputTokens: 0,
    latencyMs: 0,
    mode,
    model: null,
    occurredAt: context.proposedAt,
    outputTokens: 0,
    provider: null,
    retryCount: 0,
    sessionId: context.sessionId,
  });
}
