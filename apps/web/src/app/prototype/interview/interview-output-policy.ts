import {
  interviewGuide,
  interviewGuideVersion,
  interviewPlannerVersion,
  createFieldProposal,
  getInterviewQuestion,
  getStructuredInterviewQuestions,
  type FieldProposal,
  type InterviewAnswer,
  type InterviewQuestion,
} from "./interview-guide";

export type InterviewOutputViolation =
  | "field-mapping-drift"
  | "inferred-field-value"
  | "invalid-provenance"
  | "planner-contract-drift"
  | "reason-code-drift"
  | "unapproved-prompt"
  | "unexpected-output-field"
  | "unknown-question";

const questionKeys = [
  "fieldLabel",
  "id",
  "prompt",
  "purpose",
  "selection",
  "topic",
] as const;

const selectionKeys = [
  "explanation",
  "guideVersion",
  "model",
  "planner",
  "plannerVersion",
  "reasonCode",
  "sourceReferences",
] as const;

const sourceReferenceKeys = ["questionId", "responseRevision"] as const;
const fieldProposalKeys = [
  "fieldLabel",
  "sourceText",
  "topic",
  "value",
] as const;

export function validateInterviewQuestionOutput(
  output: unknown,
): ReadonlyArray<InterviewOutputViolation> {
  const violations = new Set<InterviewOutputViolation>();
  if (!isRecord(output)) return ["unexpected-output-field"];

  if (!hasExactKeys(output, questionKeys)) {
    violations.add("unexpected-output-field");
  }

  const mapping = interviewGuide.sourceToFieldMappings.find(
    ({ questionId }) => questionId === output.id,
  );
  if (!mapping) {
    violations.add("unknown-question");
  } else if (
    output.fieldLabel !== mapping.fieldLabel ||
    output.topic !== mapping.topic
  ) {
    violations.add("field-mapping-drift");
  }

  const selection = output.selection;
  if (!isRecord(selection)) {
    violations.add("planner-contract-drift");
    return [...violations];
  }

  if (!hasExactKeys(selection, selectionKeys)) {
    violations.add("unexpected-output-field");
  }

  if (
    selection.guideVersion !== interviewGuideVersion ||
    selection.model !== null ||
    selection.planner !== "deterministic-template" ||
    selection.plannerVersion !== interviewPlannerVersion
  ) {
    violations.add("planner-contract-drift");
  }

  if (!Array.isArray(selection.sourceReferences)) {
    violations.add("invalid-provenance");
  } else if (
    selection.sourceReferences.some(
      (reference) =>
        !isRecord(reference) ||
        !hasExactKeys(reference, sourceReferenceKeys) ||
        !interviewGuide.requiredQuestionIds.includes(
          reference.questionId as string,
        ) ||
        !Number.isInteger(reference.responseRevision) ||
        (reference.responseRevision as number) < 1,
    )
  ) {
    violations.add("invalid-provenance");
  }

  const approvedProbe = interviewGuide.approvedOptionalProbes.find(
    (probe) => probe.questionId === output.id && probe.prompt === output.prompt,
  );
  const requiredQuestion = getRequiredQuestionContract(output.id);

  if (approvedProbe) {
    const expectedExplanation = `This approved follow-up appeared because you mentioned “${approvedProbe.displayTerm}.” It does not interpret anything beyond that word.`;
    if (
      selection.reasonCode !== approvedProbe.reasonCode ||
      selection.explanation !== expectedExplanation
    ) {
      violations.add("reason-code-drift");
    }
    if (!requiredQuestion || output.purpose !== requiredQuestion.purpose) {
      violations.add("unapproved-prompt");
    }
    if (
      !Array.isArray(selection.sourceReferences) ||
      selection.sourceReferences.length !== 1
    ) {
      violations.add("invalid-provenance");
    }
  } else if (mapping) {
    if (
      !requiredQuestion ||
      output.prompt !== requiredQuestion.prompt ||
      output.purpose !== requiredQuestion.purpose
    ) {
      violations.add("unapproved-prompt");
    }
    if (
      selection.reasonCode !== "required-core" ||
      selection.explanation !==
        "This question is part of Argent’s fixed interview guide and does not rely on an inferred trait."
    ) {
      violations.add("reason-code-drift");
    }
    if (
      !Array.isArray(selection.sourceReferences) ||
      selection.sourceReferences.length !== 0
    ) {
      violations.add("invalid-provenance");
    }
  }

  return [...violations];
}

export function validateFieldProposalOutput(
  output: unknown,
): ReadonlyArray<InterviewOutputViolation> {
  const violations = new Set<InterviewOutputViolation>();
  if (!isRecord(output)) return ["unexpected-output-field"];

  if (!hasExactKeys(output, fieldProposalKeys)) {
    violations.add("unexpected-output-field");
  }

  const mapping = interviewGuide.sourceToFieldMappings.find(
    ({ fieldLabel, topic }) =>
      fieldLabel === output.fieldLabel && topic === output.topic,
  );
  if (!mapping) violations.add("field-mapping-drift");

  if (
    typeof output.sourceText !== "string" ||
    typeof output.value !== "string" ||
    output.value !== output.sourceText
  ) {
    violations.add("inferred-field-value");
  }

  return [...violations];
}

function getRequiredQuestionContract(
  questionId: unknown,
): Pick<InterviewQuestion, "prompt" | "purpose"> | undefined {
  return typeof questionId === "string"
    ? getStructuredInterviewQuestions().find(
        (question) => question.id === questionId,
      )
    : undefined;
}

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

export function assertInterviewQuestionOutput(
  output: unknown,
): asserts output is InterviewQuestion {
  const violations = validateInterviewQuestionOutput(output);
  if (violations.length > 0) {
    throw new Error(
      `Interview question output rejected: ${violations.join(", ")}`,
    );
  }
}

export function assertFieldProposalOutput(
  output: unknown,
): asserts output is FieldProposal {
  const violations = validateFieldProposalOutput(output);
  if (violations.length > 0) {
    throw new Error(`Field proposal output rejected: ${violations.join(", ")}`);
  }
}

export function getPolicyCompliantInterviewQuestion(
  index: number,
  answers: ReadonlyArray<InterviewAnswer>,
): InterviewQuestion | null {
  const question = getInterviewQuestion(index, answers);
  if (question) assertInterviewQuestionOutput(question);
  return question;
}

export function getPolicyCompliantStructuredQuestions(): ReadonlyArray<InterviewQuestion> {
  return getStructuredInterviewQuestions().map((question) => {
    assertInterviewQuestionOutput(question);
    return question;
  });
}

export function createPolicyCompliantFieldProposal(
  question: InterviewQuestion,
  sourceText: string,
): FieldProposal {
  const proposal = createFieldProposal(question, sourceText);
  assertFieldProposalOutput(proposal);
  return proposal;
}
