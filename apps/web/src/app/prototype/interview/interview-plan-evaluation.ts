import {
  getInterviewQuestion,
  getInterviewQuestionCount,
  type InterviewAnswer,
  type InterviewQuestion,
  type InterviewQuestionReasonCode,
  type InterviewTopic,
} from "./interview-guide";

export type InterviewPlanRun = {
  answers: ReadonlyArray<InterviewAnswer>;
  status: "active" | "complete";
  turns: ReadonlyArray<InterviewQuestion>;
};

export type InterviewPlanEvaluationMetric =
  | "compoundQuestionRate"
  | "prematureTerminationCount"
  | "repetitiveAcknowledgementRate"
  | "topicDriftCount"
  | "unsupportedInferenceCount";

export type InterviewPlanEvaluation = {
  metrics: Record<InterviewPlanEvaluationMetric, number>;
  passed: boolean;
  thresholds: Record<InterviewPlanEvaluationMetric, number>;
  violations: ReadonlyArray<{
    metric: InterviewPlanEvaluationMetric;
    questionId?: string;
    turnIndex?: number;
  }>;
};

export const interviewPlanEvaluationThresholds = {
  compoundQuestionRate: 0,
  prematureTerminationCount: 0,
  repetitiveAcknowledgementRate: 0,
  topicDriftCount: 0,
  unsupportedInferenceCount: 0,
} as const satisfies Record<InterviewPlanEvaluationMetric, number>;

const reasonTopics: Readonly<
  Partial<Record<InterviewQuestionReasonCode, InterviewTopic>>
> = {
  "source-grounded-boundaries": "personal-boundaries",
  "source-grounded-pace": "introduction-pace",
  "source-grounded-rhythm": "life-rhythm",
};

export function evaluateInterviewPlanRun(
  run: InterviewPlanRun,
): InterviewPlanEvaluation {
  const guideTopics = getGuideTopics();
  const violations: Array<InterviewPlanEvaluation["violations"][number]> = [];
  let compoundQuestionCount = 0;
  let repetitiveAcknowledgementCount = 0;
  let previousAcknowledgement: string | null = null;

  run.turns.forEach((question, turnIndex) => {
    if (isCompoundQuestion(question.prompt)) {
      compoundQuestionCount += 1;
      violations.push({
        metric: "compoundQuestionRate",
        questionId: question.id,
        turnIndex,
      });
    }

    const acknowledgement = getAcknowledgement(question.prompt);
    if (acknowledgement && acknowledgement === previousAcknowledgement) {
      repetitiveAcknowledgementCount += 1;
      violations.push({
        metric: "repetitiveAcknowledgementRate",
        questionId: question.id,
        turnIndex,
      });
    }
    previousAcknowledgement = acknowledgement;

    if (guideTopics.get(question.id) !== question.topic) {
      violations.push({
        metric: "topicDriftCount",
        questionId: question.id,
        turnIndex,
      });
    }

    if (!hasSupportedSelection(question, run.answers)) {
      violations.push({
        metric: "unsupportedInferenceCount",
        questionId: question.id,
        turnIndex,
      });
    }
  });

  const coveredTopics = new Set(run.turns.map((question) => question.topic));
  const endedPrematurely =
    run.status === "complete" &&
    [...guideTopics.values()].some((topic) => !coveredTopics.has(topic));

  if (endedPrematurely) {
    violations.push({ metric: "prematureTerminationCount" });
  }

  const turnCount = run.turns.length;
  const metrics: InterviewPlanEvaluation["metrics"] = {
    compoundQuestionRate: rate(compoundQuestionCount, turnCount),
    prematureTerminationCount: endedPrematurely ? 1 : 0,
    repetitiveAcknowledgementRate: rate(
      repetitiveAcknowledgementCount,
      turnCount,
    ),
    topicDriftCount: violations.filter(
      ({ metric }) => metric === "topicDriftCount",
    ).length,
    unsupportedInferenceCount: violations.filter(
      ({ metric }) => metric === "unsupportedInferenceCount",
    ).length,
  };

  return {
    metrics,
    passed: Object.entries(metrics).every(
      ([metric, value]) =>
        value <=
        interviewPlanEvaluationThresholds[
          metric as InterviewPlanEvaluationMetric
        ],
    ),
    thresholds: interviewPlanEvaluationThresholds,
    violations,
  };
}

function getGuideTopics(): ReadonlyMap<string, InterviewTopic> {
  const topics = new Map<string, InterviewTopic>();

  for (let index = 0; index < getInterviewQuestionCount(); index += 1) {
    const question = getInterviewQuestion(index, []);
    if (question) {
      topics.set(question.id, question.topic);
    }
  }

  return topics;
}

function hasSupportedSelection(
  question: InterviewQuestion,
  answers: ReadonlyArray<InterviewAnswer>,
): boolean {
  const { reasonCode, sourceReferences } = question.selection;

  if (reasonCode === "required-core") {
    return sourceReferences.length === 0;
  }

  if (
    reasonTopics[reasonCode] !== question.topic ||
    sourceReferences.length !== 1
  ) {
    return false;
  }

  const [reference] = sourceReferences;
  return answers.some(
    (answer) =>
      answer.questionId === reference.questionId &&
      answer.revision === reference.responseRevision &&
      answer.sourceText !== "Prefer not to answer",
  );
}

function isCompoundQuestion(prompt: string): boolean {
  const questionMarks = prompt.match(/\?/gu)?.length ?? 0;
  const joinedQuestion =
    /\b(?:and|or)\s+(?:can|could|did|do|does|how|is|are|what|when|where|which|who|why|would)\b/iu;

  return questionMarks > 1 || joinedQuestion.test(prompt);
}

function getAcknowledgement(prompt: string): string | null {
  const firstSentence = prompt.match(/^([^.!?]+[.!])/u)?.[1];
  if (!firstSentence) {
    return null;
  }

  const normalized = firstSentence.trim().toLocaleLowerCase();
  return /^(i (?:hear|understand)|thank you|you (?:described|mentioned|said))\b/u.test(
    normalized,
  )
    ? normalized
    : null;
}

function rate(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}
