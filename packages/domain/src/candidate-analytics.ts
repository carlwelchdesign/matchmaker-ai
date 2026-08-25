import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";
import {
  candidateIntelligenceSchemaVersion,
  evaluateCandidateAssertionAccess,
  type CandidateAssertionAccessReason,
  type CandidateAssertionAccessRequest,
  type CandidateFieldKnowledgeState,
  type CandidateIntelligenceRecord,
} from "./candidate-intelligence.js";
import {
  interviewOutcomeSchemaVersion,
  validateInterviewOutcomeMeasurement,
  type InterviewOutcomeMeasurement,
} from "./interview-unit-economics.js";
import {
  interviewUsageSchemaVersion,
  validateInterviewUsageExecution,
  type InterviewUsageExecution,
  type InterviewUsageMode,
} from "./interview-usage.js";

export const candidateAnalyticsSnapshotSchemaVersion =
  "candidate-analytics-snapshot/v1" as const;
export const candidateInterviewFunnelSchemaVersion =
  "candidate-interview-funnel/v1" as const;
export const candidateAssertionEligibilitySchemaVersion =
  "candidate-assertion-eligibility/v1" as const;

export interface CandidateAnalyticsSnapshotRequest {
  readonly cohortKey: string;
  readonly minimumCohortSize: number;
  readonly windowEnd: string;
  readonly windowStart: string;
}

export interface CandidateAnalyticsMetricSet {
  readonly approvedAssertionCount: number;
  readonly approvedFieldCoverageBasisPoints: number | null;
  readonly candidateSupplyCount: number;
  readonly excludedAssertionCount: number;
  readonly fieldStateCounts: Readonly<
    Record<CandidateFieldKnowledgeState, number>
  >;
  readonly observedFieldCount: number;
}

export interface CandidateAnalyticsSnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly lineage: {
    readonly approvedAssertionsOnly: true;
    readonly projectedAt: string;
    readonly projectionSchemaVersion: typeof candidatePurposeProjectionSchemaVersion;
    readonly rawSourceIncluded: false;
  };
  readonly metrics: CandidateAnalyticsMetricSet | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateAnalyticsSnapshotSchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

export type CandidateInterviewModeAttribution =
  InterviewUsageMode | "mixed" | "unobserved";

export interface CandidateInterviewFunnelMetric {
  readonly approvedFieldCount: number;
  readonly completedCount: number;
  readonly completionRateBasisPoints: number | null;
  readonly correctionCount: number;
  readonly correctionsPerCompletionBasisPoints: number | null;
  readonly startedCount: number;
}

export interface CandidateInterviewFunnelSnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly lineage: {
    readonly outcomeSchemaVersion: typeof interviewOutcomeSchemaVersion;
    readonly sourceContentStored: false;
    readonly usageSchemaVersion: typeof interviewUsageSchemaVersion;
  };
  readonly metrics: {
    readonly byMode: Readonly<
      Record<CandidateInterviewModeAttribution, CandidateInterviewFunnelMetric>
    >;
    readonly overall: CandidateInterviewFunnelMetric;
  } | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateInterviewFunnelSchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

export interface CandidateAssertionEligibilitySnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly evaluatedAt: string;
  readonly lineage: {
    readonly candidateIntelligenceSchemaVersion: typeof candidateIntelligenceSchemaVersion;
    readonly sourceContentStored: false;
  };
  readonly metrics: {
    readonly assertionCount: number;
    readonly decisionCounts: Readonly<
      Record<CandidateAssertionAccessReason, number>
    >;
    readonly eligibleAssertionCount: number;
  } | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateAssertionEligibilitySchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

const cohortKeyPattern = /^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function buildCandidateAnalyticsSnapshot(
  projection: CandidatePurposeProjection,
  request: CandidateAnalyticsSnapshotRequest,
): CandidateAnalyticsSnapshot {
  validateProjection(projection);
  const scope = validateAnalyticsScope(request);
  if (
    projection.projectedAt < scope.windowStart ||
    projection.projectedAt > scope.windowEnd
  ) {
    throw new Error("Projection time must fall inside the analytics window");
  }

  const base: Omit<CandidateAnalyticsSnapshot, "dataState" | "metrics"> = {
    cohortKey: scope.cohortKey,
    lineage: {
      approvedAssertionsOnly: true,
      projectedAt: projection.projectedAt,
      projectionSchemaVersion: projection.schemaVersion,
      rawSourceIncluded: false,
    },
    minimumCohortSize: scope.minimumCohortSize,
    schemaVersion: candidateAnalyticsSnapshotSchemaVersion,
    windowEnd: scope.windowEnd,
    windowStart: scope.windowStart,
  };

  if (projection.candidateCount < scope.minimumCohortSize) {
    return {
      ...base,
      dataState: "suppressed-small-cohort",
      metrics: null,
    };
  }

  const observedFieldCount = Object.values(projection.fieldStateCounts).reduce(
    (total, count) => total + count,
    0,
  );
  const approvedAssertionCount = projection.includedAssertions.length;

  return {
    ...base,
    dataState: "available",
    metrics: {
      approvedAssertionCount,
      approvedFieldCoverageBasisPoints:
        observedFieldCount === 0
          ? null
          : Math.round((approvedAssertionCount * 10_000) / observedFieldCount),
      candidateSupplyCount: projection.candidateCount,
      excludedAssertionCount: projection.excludedAssertionCount,
      fieldStateCounts: { ...projection.fieldStateCounts },
      observedFieldCount,
    },
  };
}

export function buildCandidateInterviewFunnelSnapshot(input: {
  readonly outcomes: readonly InterviewOutcomeMeasurement[];
  readonly request: CandidateAnalyticsSnapshotRequest;
  readonly usage: readonly InterviewUsageExecution[];
}): CandidateInterviewFunnelSnapshot {
  const scope = validateAnalyticsScope(input.request);
  const outcomes = input.outcomes.map(validateInterviewOutcomeMeasurement);
  const usage = input.usage.map(validateInterviewUsageExecution);
  validateFunnelLineage(outcomes, usage, scope);

  const base: Omit<CandidateInterviewFunnelSnapshot, "dataState" | "metrics"> =
    {
      cohortKey: scope.cohortKey,
      lineage: {
        outcomeSchemaVersion: interviewOutcomeSchemaVersion,
        sourceContentStored: false,
        usageSchemaVersion: interviewUsageSchemaVersion,
      },
      minimumCohortSize: scope.minimumCohortSize,
      schemaVersion: candidateInterviewFunnelSchemaVersion,
      windowEnd: scope.windowEnd,
      windowStart: scope.windowStart,
    };

  if (outcomes.length < scope.minimumCohortSize) {
    return {
      ...base,
      dataState: "suppressed-small-cohort",
      metrics: null,
    };
  }

  const outcomesByMode = createEmptyModeBuckets();
  const modesBySession = new Map<string, Set<InterviewUsageMode>>();
  for (const execution of usage) {
    const modes = modesBySession.get(execution.sessionId) ?? new Set();
    modes.add(execution.mode);
    modesBySession.set(execution.sessionId, modes);
  }
  for (const outcome of outcomes) {
    const modes = modesBySession.get(outcome.sessionId);
    const attribution =
      !modes || modes.size === 0
        ? "unobserved"
        : modes.size === 1
          ? [...modes][0]!
          : "mixed";
    outcomesByMode[attribution].push(outcome);
  }

  return {
    ...base,
    dataState: "available",
    metrics: {
      byMode: {
        hybrid: summarizeOutcomes(outcomesByMode.hybrid),
        mixed: summarizeOutcomes(outcomesByMode.mixed),
        structured: summarizeOutcomes(outcomesByMode.structured),
        "typed-conversation": summarizeOutcomes(
          outcomesByMode["typed-conversation"],
        ),
        unobserved: summarizeOutcomes(outcomesByMode.unobserved),
        voice: summarizeOutcomes(outcomesByMode.voice),
      },
      overall: summarizeOutcomes(outcomes),
    },
  };
}

export function buildCandidateAssertionEligibilitySnapshot(input: {
  readonly access: CandidateAssertionAccessRequest;
  readonly records: readonly CandidateIntelligenceRecord[];
  readonly request: CandidateAnalyticsSnapshotRequest;
}): CandidateAssertionEligibilitySnapshot {
  const scope = validateAnalyticsScope(input.request);
  const evaluatedAt = requireIsoTimestamp(
    input.access.at,
    "Assertion eligibility evaluation time",
  );
  if (
    input.access.purpose !== "candidate-analytics" ||
    input.access.role !== "data-analyst"
  ) {
    throw new Error(
      "Candidate assertion eligibility requires analytics-only access",
    );
  }
  if (evaluatedAt < scope.windowStart || evaluatedAt > scope.windowEnd) {
    throw new Error(
      "Assertion eligibility evaluation must fall inside the analytics window",
    );
  }

  const decisionCounts = createEmptyAccessDecisionCounts();
  const candidateIds = new Set<string>();
  const assertionIds = new Set<string>();
  for (const record of input.records) {
    if (record.schemaVersion !== candidateIntelligenceSchemaVersion) {
      throw new Error("Candidate intelligence version is not supported");
    }
    if (candidateIds.has(record.candidateId)) {
      throw new Error(
        "Candidate assertion eligibility contains duplicate candidates",
      );
    }
    candidateIds.add(record.candidateId);
    for (const assertion of record.assertions) {
      if (assertion.candidateId !== record.candidateId) {
        throw new Error(
          "Candidate assertion does not belong to its intelligence record",
        );
      }
      if (assertionIds.has(assertion.assertionId)) {
        throw new Error(
          "Candidate assertion eligibility contains duplicate assertions",
        );
      }
      assertionIds.add(assertion.assertionId);
      const decision = evaluateCandidateAssertionAccess(
        assertion,
        input.access,
      );
      decisionCounts[decision.reason] += 1;
    }
  }

  const base: Omit<
    CandidateAssertionEligibilitySnapshot,
    "dataState" | "metrics"
  > = {
    cohortKey: scope.cohortKey,
    evaluatedAt,
    lineage: {
      candidateIntelligenceSchemaVersion,
      sourceContentStored: false,
    },
    minimumCohortSize: scope.minimumCohortSize,
    schemaVersion: candidateAssertionEligibilitySchemaVersion,
    windowEnd: scope.windowEnd,
    windowStart: scope.windowStart,
  };

  if (candidateIds.size < scope.minimumCohortSize) {
    return {
      ...base,
      dataState: "suppressed-small-cohort",
      metrics: null,
    };
  }

  return {
    ...base,
    dataState: "available",
    metrics: {
      assertionCount: assertionIds.size,
      decisionCounts,
      eligibleAssertionCount: decisionCounts.eligible,
    },
  };
}

function validateProjection(projection: CandidatePurposeProjection): void {
  if (projection.schemaVersion !== candidatePurposeProjectionSchemaVersion) {
    throw new Error("Candidate analytics projection version is not supported");
  }
  if (
    projection.purpose !== "candidate-analytics" ||
    projection.role !== "data-analyst"
  ) {
    throw new Error(
      "Candidate analytics requires an analytics-only projection",
    );
  }
  if (!projection.approvedAssertionsOnly || projection.rawSourceIncluded) {
    throw new Error(
      "Candidate analytics projection violates its data boundary",
    );
  }
  const counts = [
    projection.candidateCount,
    projection.evaluatedAssertionCount,
    projection.excludedAssertionCount,
    ...Object.values(projection.fieldStateCounts),
  ];
  if (counts.some((count) => !Number.isSafeInteger(count) || count < 0)) {
    throw new Error(
      "Candidate analytics projection counts must be non-negative integers",
    );
  }
  if (
    projection.evaluatedAssertionCount - projection.excludedAssertionCount !==
    projection.includedAssertions.length
  ) {
    throw new Error(
      "Candidate analytics projection assertion counts are inconsistent",
    );
  }
}

function validateFunnelLineage(
  outcomes: readonly InterviewOutcomeMeasurement[],
  usage: readonly InterviewUsageExecution[],
  scope: CandidateAnalyticsSnapshotRequest,
): void {
  const outcomesBySession = new Map(
    outcomes.map((outcome) => [outcome.sessionId, outcome]),
  );
  if (outcomesBySession.size !== outcomes.length) {
    throw new Error("Candidate interview funnel contains duplicate sessions");
  }
  const executionIds = new Set(usage.map((execution) => execution.executionId));
  if (executionIds.size !== usage.length) {
    throw new Error("Candidate interview funnel contains duplicate executions");
  }

  for (const outcome of outcomes) {
    if (
      outcome.startedAt < scope.windowStart ||
      outcome.startedAt > scope.windowEnd ||
      (outcome.completedAt !== null && outcome.completedAt > scope.windowEnd)
    ) {
      throw new Error(
        "Candidate interview outcome falls outside the funnel window",
      );
    }
  }
  for (const execution of usage) {
    const outcome = outcomesBySession.get(execution.sessionId);
    if (!outcome) {
      throw new Error("Candidate interview usage has no outcome session");
    }
    if (
      execution.occurredAt < outcome.startedAt ||
      execution.occurredAt > scope.windowEnd ||
      (outcome.completedAt !== null &&
        execution.occurredAt > outcome.completedAt)
    ) {
      throw new Error("Candidate interview usage falls outside its session");
    }
  }
}

function summarizeOutcomes(
  outcomes: readonly InterviewOutcomeMeasurement[],
): CandidateInterviewFunnelMetric {
  const completedCount = outcomes.filter(
    (outcome) => outcome.completedAt !== null,
  ).length;
  const correctionCount = sumSafeIntegers(
    outcomes.map((outcome) => outcome.correctionCount),
    "Candidate interview correction count",
  );
  return {
    approvedFieldCount: sumSafeIntegers(
      outcomes.map((outcome) => outcome.approvedFieldCount),
      "Candidate interview approved field count",
    ),
    completedCount,
    completionRateBasisPoints: ratioBasisPoints(
      completedCount,
      outcomes.length,
    ),
    correctionCount,
    correctionsPerCompletionBasisPoints: ratioBasisPoints(
      correctionCount,
      completedCount,
    ),
    startedCount: outcomes.length,
  };
}

function createEmptyModeBuckets(): Record<
  CandidateInterviewModeAttribution,
  InterviewOutcomeMeasurement[]
> {
  return {
    hybrid: [],
    mixed: [],
    structured: [],
    "typed-conversation": [],
    unobserved: [],
    voice: [],
  };
}

function createEmptyAccessDecisionCounts(): Record<
  CandidateAssertionAccessReason,
  number
> {
  return {
    eligible: 0,
    "freshness-expired": 0,
    "lifecycle-disputed": 0,
    "lifecycle-stale": 0,
    "lifecycle-superseded": 0,
    "lifecycle-withdrawn": 0,
    "purpose-not-granted": 0,
    "purpose-role-mismatch": 0,
    "retention-expired": 0,
    "role-not-granted": 0,
  };
}

function validateAnalyticsScope(
  request: CandidateAnalyticsSnapshotRequest,
): CandidateAnalyticsSnapshotRequest {
  const windowStart = requireIsoTimestamp(
    request.windowStart,
    "Analytics window start",
  );
  const windowEnd = requireIsoTimestamp(
    request.windowEnd,
    "Analytics window end",
  );
  if (windowStart >= windowEnd) {
    throw new Error("Analytics window start must be before window end");
  }
  if (!cohortKeyPattern.test(request.cohortKey)) {
    throw new Error("Analytics cohort key must be an opaque cohort identifier");
  }
  if (
    !Number.isSafeInteger(request.minimumCohortSize) ||
    request.minimumCohortSize < 5
  ) {
    throw new Error("Analytics minimum cohort size must be at least five");
  }
  return { ...request, windowEnd, windowStart };
}

function ratioBasisPoints(
  numerator: number,
  denominator: number,
): number | null {
  return denominator === 0
    ? null
    : Math.round((numerator * 10_000) / denominator);
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

function requireIsoTimestamp(value: string, label: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}
