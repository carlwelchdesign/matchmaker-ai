import {
  interviewGuide,
  type InterviewQuestion,
  type InterviewTopic,
} from "./interview-guide";

export const humanAssistanceContractVersion =
  "argent-human-assistance-preview-2026-08-25";

const excludedContext = [
  "draft-response",
  "prior-answers",
  "proposed-profile-fields",
] as const;

type HumanAssistanceContext =
  | {
      fieldLabel: string;
      kind: "current-topic";
      questionId: string;
      topic: InterviewTopic;
    }
  | { kind: "structured-guide" };

export type HumanAssistanceRequestPreview = {
  context: HumanAssistanceContext;
  contractVersion: typeof humanAssistanceContractVersion;
  excludedContext: typeof excludedContext;
  requestKind: "interview-help";
};

export type LocallyStagedHumanAssistanceRequest =
  HumanAssistanceRequestPreview & {
    delivery: {
      contactedHuman: false;
      mode: "local-preview";
      sentCandidateContent: false;
      state: "staged-locally";
    };
  };

export function createHumanAssistanceRequestPreview(
  question?: Pick<InterviewQuestion, "fieldLabel" | "id" | "topic">,
): HumanAssistanceRequestPreview {
  const context: HumanAssistanceContext = question
    ? {
        fieldLabel: question.fieldLabel,
        kind: "current-topic",
        questionId: question.id,
        topic: question.topic,
      }
    : { kind: "structured-guide" };

  const preview: HumanAssistanceRequestPreview = {
    context,
    contractVersion: humanAssistanceContractVersion,
    excludedContext,
    requestKind: "interview-help",
  };
  assertHumanAssistanceRequestPreview(preview);
  return preview;
}

export function stageHumanAssistanceRequestLocally(
  preview: HumanAssistanceRequestPreview,
): LocallyStagedHumanAssistanceRequest {
  assertHumanAssistanceRequestPreview(preview);
  return {
    ...preview,
    delivery: {
      contactedHuman: false,
      mode: "local-preview",
      sentCandidateContent: false,
      state: "staged-locally",
    },
  };
}

export function assertHumanAssistanceRequestPreview(
  value: unknown,
): asserts value is HumanAssistanceRequestPreview {
  if (!isRecord(value) || !hasExactKeys(value, previewKeys)) {
    throw new Error("Human-assistance preview rejected: unexpected fields");
  }
  const candidateExcludedContext = value.excludedContext;
  if (
    value.contractVersion !== humanAssistanceContractVersion ||
    value.requestKind !== "interview-help" ||
    !Array.isArray(candidateExcludedContext) ||
    candidateExcludedContext.length !== excludedContext.length ||
    !excludedContext.every(
      (entry, index) => candidateExcludedContext[index] === entry,
    )
  ) {
    throw new Error("Human-assistance preview rejected: contract drift");
  }

  const candidateContext = value.context;
  if (!isRecord(candidateContext)) {
    throw new Error("Human-assistance preview rejected: invalid context");
  }
  if (candidateContext.kind === "structured-guide") {
    if (!hasExactKeys(candidateContext, structuredContextKeys)) {
      throw new Error("Human-assistance preview rejected: unexpected context");
    }
    return;
  }
  if (
    candidateContext.kind !== "current-topic" ||
    !hasExactKeys(candidateContext, topicContextKeys)
  ) {
    throw new Error("Human-assistance preview rejected: invalid context");
  }

  const mapping = interviewGuide.sourceToFieldMappings.find(
    ({ questionId }) => questionId === candidateContext.questionId,
  );
  if (
    !mapping ||
    mapping.fieldLabel !== candidateContext.fieldLabel ||
    mapping.topic !== candidateContext.topic
  ) {
    throw new Error("Human-assistance preview rejected: mapping drift");
  }
}

const previewKeys = [
  "context",
  "contractVersion",
  "excludedContext",
  "requestKind",
] as const;
const structuredContextKeys = ["kind"] as const;
const topicContextKeys = ["fieldLabel", "kind", "questionId", "topic"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    [...expectedKeys].sort().every((key, index) => key === actualKeys[index])
  );
}
