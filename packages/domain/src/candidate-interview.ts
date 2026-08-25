export const candidateInterviewReviewSchemaVersion =
  "candidate-interview-review/v1" as const;

export type CandidateFieldDisposition =
  "approved" | "declined" | "private" | "rejected";

export interface CandidateInterviewFieldInput {
  readonly disposition: CandidateFieldDisposition;
  readonly fieldLabel: string;
  readonly questionId: string;
  readonly responseRevision: number;
  readonly sourceText: string;
  readonly topic: string;
}

export interface CandidateInterviewReviewInput {
  readonly fields: readonly CandidateInterviewFieldInput[];
  readonly guideVersion: string;
}

export interface CandidateInterviewReviewField {
  readonly derivation: "source-exact";
  readonly disposition: CandidateFieldDisposition;
  readonly eligibleForAnalytics: boolean;
  readonly eligibleForProfileUse: boolean;
  readonly fieldLabel: string;
  readonly provenance: {
    readonly guideVersion: string;
    readonly questionId: string;
    readonly responseRevision: number;
  };
  readonly sourceText: string;
  readonly topic: string;
}

export interface CandidateInterviewReview {
  readonly approvedFieldCount: number;
  readonly fields: readonly CandidateInterviewReviewField[];
  readonly guideVersion: string;
  readonly schemaVersion: typeof candidateInterviewReviewSchemaVersion;
}

const declinedSourceText = "Prefer not to answer";
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const maximumSourceLength = 4_000;
const validDispositions = new Set<CandidateFieldDisposition>([
  "approved",
  "declined",
  "private",
  "rejected",
]);

export function buildCandidateInterviewReview(
  input: CandidateInterviewReviewInput,
): CandidateInterviewReview {
  const guideVersion = requireIdentifier(input.guideVersion, "Guide version");

  if (input.fields.length === 0) {
    throw new Error("Interview review must contain at least one field");
  }

  const seenQuestionIds = new Set<string>();
  const fields = input.fields.map((field) => {
    const questionId = requireIdentifier(field.questionId, "Question ID");
    if (seenQuestionIds.has(questionId)) {
      throw new Error(`Duplicate interview question: ${questionId}`);
    }
    seenQuestionIds.add(questionId);

    const fieldLabel = requireText(field.fieldLabel, "Field label");
    const topic = requireIdentifier(field.topic, "Topic");
    const sourceText = requireText(field.sourceText, "Source text");

    if (!validDispositions.has(field.disposition)) {
      throw new Error("Field disposition is not supported");
    }

    if (sourceText.length > maximumSourceLength) {
      throw new Error(
        `Source text must not exceed ${maximumSourceLength} characters`,
      );
    }

    if (
      !Number.isInteger(field.responseRevision) ||
      field.responseRevision < 1
    ) {
      throw new Error("Response revision must be a positive integer");
    }

    if (
      (field.disposition === "declined") !==
      (sourceText === declinedSourceText)
    ) {
      throw new Error(
        "Declined fields must use the explicit prefer-not-to-answer source",
      );
    }

    const approved = field.disposition === "approved";

    return {
      derivation: "source-exact" as const,
      disposition: field.disposition,
      eligibleForAnalytics: approved,
      eligibleForProfileUse: approved,
      fieldLabel,
      provenance: {
        guideVersion,
        questionId,
        responseRevision: field.responseRevision,
      },
      sourceText,
      topic,
    };
  });

  return {
    approvedFieldCount: fields.filter(
      (field) => field.disposition === "approved",
    ).length,
    fields,
    guideVersion,
    schemaVersion: candidateInterviewReviewSchemaVersion,
  };
}

function requireIdentifier(value: string, label: string): string {
  const normalized = requireText(value, label);
  if (!identifierPattern.test(normalized)) {
    throw new Error(`${label} must be a lowercase kebab-case identifier`);
  }
  return normalized;
}

function requireText(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} must not be empty`);
  }
  return normalized;
}
