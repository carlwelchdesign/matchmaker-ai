import {
  validateInterviewUsageExecution,
  type InterviewUsageExecution,
} from "./interview-usage.js";

export const interviewOutcomeSchemaVersion =
  "interview-outcome-measurement/v1" as const;
export const interviewUnitEconomicsSchemaVersion =
  "interview-unit-economics-report/v1" as const;

export interface InterviewOutcomeMeasurementInput {
  readonly approvedFieldCount: number;
  readonly completedAt: string | null;
  readonly correctionCount: number;
  readonly estimatedHumanReviewTimeSavedMs: number;
  readonly sessionId: string;
  readonly startedAt: string;
}

export interface InterviewOutcomeMeasurement extends InterviewOutcomeMeasurementInput {
  readonly schemaVersion: typeof interviewOutcomeSchemaVersion;
  readonly sourceContentStored: false;
}

export interface InterviewUnitEconomicsReport {
  readonly approvedFieldCount: number;
  readonly completedInterviewCount: number;
  readonly correctionCount: number;
  readonly estimatedCostMicrousdPerApprovedField: number | null;
  readonly estimatedCostMicrousdPerCompletion: number | null;
  readonly estimatedCostMicrousdPerCorrection: number | null;
  readonly estimatedCostMicrousdPerHumanReviewMinuteSaved: number | null;
  readonly estimatedCostMicrousdPerStart: number | null;
  readonly estimatedHumanReviewTimeSavedMs: number;
  readonly schemaVersion: typeof interviewUnitEconomicsSchemaVersion;
  readonly sourceContentStored: false;
  readonly startedInterviewCount: number;
  readonly totalEstimatedCostMicrousd: number;
}

const outcomeInputKeys = [
  "approvedFieldCount",
  "completedAt",
  "correctionCount",
  "estimatedHumanReviewTimeSavedMs",
  "sessionId",
  "startedAt",
] as const;
const outcomeKeys = [
  ...outcomeInputKeys,
  "schemaVersion",
  "sourceContentStored",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function recordInterviewOutcomeMeasurement(
  input: unknown,
): InterviewOutcomeMeasurement {
  if (!isRecord(input) || !hasExactKeys(input, outcomeInputKeys)) {
    throw new Error("Interview outcome rejected: unexpected or missing fields");
  }

  const startedAt = requireIsoTimestamp(input.startedAt, "Started at");
  const completedAt =
    input.completedAt === null
      ? null
      : requireIsoTimestamp(input.completedAt, "Completed at");
  const approvedFieldCount = requireNonNegativeInteger(
    input.approvedFieldCount,
    "Approved field count",
  );
  const estimatedHumanReviewTimeSavedMs = requireNonNegativeInteger(
    input.estimatedHumanReviewTimeSavedMs,
    "Estimated human review time saved",
  );

  if (completedAt !== null && Date.parse(completedAt) < Date.parse(startedAt)) {
    throw new Error("Interview completion cannot precede its start");
  }
  if (
    completedAt === null &&
    (approvedFieldCount > 0 || estimatedHumanReviewTimeSavedMs > 0)
  ) {
    throw new Error(
      "Incomplete interviews cannot claim approved fields or review time saved",
    );
  }

  return {
    approvedFieldCount,
    completedAt,
    correctionCount: requireNonNegativeInteger(
      input.correctionCount,
      "Correction count",
    ),
    estimatedHumanReviewTimeSavedMs,
    schemaVersion: interviewOutcomeSchemaVersion,
    sessionId: requireIdentifier(input.sessionId, "Session ID"),
    sourceContentStored: false,
    startedAt,
  };
}

export function validateInterviewOutcomeMeasurement(
  input: unknown,
): InterviewOutcomeMeasurement {
  if (!isRecord(input) || !hasExactKeys(input, outcomeKeys)) {
    throw new Error(
      "Interview outcome record has unexpected or missing fields",
    );
  }
  if (
    input.schemaVersion !== interviewOutcomeSchemaVersion ||
    input.sourceContentStored !== false
  ) {
    throw new Error("Interview outcome record contract is invalid");
  }

  const {
    schemaVersion: _schemaVersion,
    sourceContentStored: _sourceContentStored,
    ...raw
  } = input;
  return recordInterviewOutcomeMeasurement(raw);
}

export function buildInterviewUnitEconomicsReport(
  input: Readonly<{
    outcomes: readonly InterviewOutcomeMeasurement[];
    usage: readonly InterviewUsageExecution[];
  }>,
): InterviewUnitEconomicsReport {
  const outcomes = input.outcomes.map(validateInterviewOutcomeMeasurement);
  const usage = input.usage.map(validateInterviewUsageExecution);
  validateReportLineage(outcomes, usage);

  const totalEstimatedCostMicrousd = sumSafeIntegers(
    usage.map((execution) => execution.estimatedCostMicrousd),
    "Total estimated interview cost",
  );
  const approvedFieldCount = sumSafeIntegers(
    outcomes.map((outcome) => outcome.approvedFieldCount),
    "Approved field count",
  );
  const correctionCount = sumSafeIntegers(
    outcomes.map((outcome) => outcome.correctionCount),
    "Correction count",
  );
  const estimatedHumanReviewTimeSavedMs = sumSafeIntegers(
    outcomes.map((outcome) => outcome.estimatedHumanReviewTimeSavedMs),
    "Estimated human review time saved",
  );
  const startedInterviewCount = outcomes.length;
  const completedInterviewCount = outcomes.filter(
    (outcome) => outcome.completedAt !== null,
  ).length;

  return {
    approvedFieldCount,
    completedInterviewCount,
    correctionCount,
    estimatedCostMicrousdPerApprovedField: divideOrNull(
      totalEstimatedCostMicrousd,
      approvedFieldCount,
    ),
    estimatedCostMicrousdPerCompletion: divideOrNull(
      totalEstimatedCostMicrousd,
      completedInterviewCount,
    ),
    estimatedCostMicrousdPerCorrection: divideOrNull(
      totalEstimatedCostMicrousd,
      correctionCount,
    ),
    estimatedCostMicrousdPerHumanReviewMinuteSaved:
      estimatedHumanReviewTimeSavedMs === 0
        ? null
        : roundRatio(
            totalEstimatedCostMicrousd,
            estimatedHumanReviewTimeSavedMs / 60_000,
          ),
    estimatedCostMicrousdPerStart: divideOrNull(
      totalEstimatedCostMicrousd,
      startedInterviewCount,
    ),
    estimatedHumanReviewTimeSavedMs,
    schemaVersion: interviewUnitEconomicsSchemaVersion,
    sourceContentStored: false,
    startedInterviewCount,
    totalEstimatedCostMicrousd,
  };
}

function validateReportLineage(
  outcomes: readonly InterviewOutcomeMeasurement[],
  usage: readonly InterviewUsageExecution[],
): void {
  const outcomesBySession = new Map(
    outcomes.map((outcome) => [outcome.sessionId, outcome]),
  );
  if (outcomesBySession.size !== outcomes.length) {
    throw new Error("Interview economics report contains duplicate sessions");
  }
  const executionIds = new Set(usage.map((execution) => execution.executionId));
  if (executionIds.size !== usage.length) {
    throw new Error("Interview economics report contains duplicate executions");
  }

  for (const execution of usage) {
    const outcome = outcomesBySession.get(execution.sessionId);
    if (!outcome) {
      throw new Error(
        `Interview usage ${execution.executionId} has no outcome session`,
      );
    }
    const occurredAt = Date.parse(execution.occurredAt);
    if (occurredAt < Date.parse(outcome.startedAt)) {
      throw new Error("Interview usage cannot precede its session start");
    }
    if (
      outcome.completedAt !== null &&
      occurredAt > Date.parse(outcome.completedAt)
    ) {
      throw new Error("Interview usage cannot follow session completion");
    }
  }
}

function divideOrNull(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : roundRatio(numerator, denominator);
}

function roundRatio(numerator: number, denominator: number): number {
  return Math.round((numerator / denominator) * 1_000_000) / 1_000_000;
}

function sumSafeIntegers(values: readonly number[], label: string): number {
  return values.reduce((total, value) => {
    const next = total + value;
    if (!Number.isSafeInteger(next)) {
      throw new Error(`${label} exceeds the safe integer range`);
    }
    return next;
  }, 0);
}

function requireIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be a lowercase identifier`);
  }
  return value;
}

function requireIsoTimestamp(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new Error(`${label} must be an ISO timestamp`);
  }
  return value;
}

function requireNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
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
