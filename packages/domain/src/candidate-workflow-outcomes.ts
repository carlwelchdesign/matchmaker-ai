import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";

export const candidateWorkflowObservationSchemaVersion =
  "candidate-workflow-observation/v1" as const;
export const candidateWorkflowFunnelSchemaVersion =
  "candidate-workflow-funnel/v1" as const;

export type CandidateWorkflowDataQualityState =
  | "backfilled"
  | "complete"
  | "delayed"
  | "invalid-quarantined"
  | "partial"
  | "stale";
export type ParticipantIntroductionDecision =
  "accepted" | "declined" | "expired" | "no-response" | "pending";
export type ParticipantFollowupInterest =
  "interested" | "not-interested" | "not-reported" | "not-applicable";
export type FirstMeetingState =
  "cancelled" | "not-applicable" | "not-reported" | "occurred";
export type RespectfulClosureState = "open" | "recorded";

export interface CandidateWorkflowObservationInput {
  readonly dataQualityState: CandidateWorkflowDataQualityState;
  readonly deliveredAt: string | null;
  readonly firstMeetingState: FirstMeetingState;
  readonly journeyId: string;
  readonly observedAt: string;
  readonly participantADecision: ParticipantIntroductionDecision;
  readonly participantAFollowupInterest: ParticipantFollowupInterest;
  readonly participantBDecision: ParticipantIntroductionDecision;
  readonly participantBFollowupInterest: ParticipantFollowupInterest;
  readonly policyVersion: string;
  readonly recommendedAt: string | null;
  readonly respectfulClosureState: RespectfulClosureState;
  readonly reviewedAt: string;
  readonly selectionProjectedAt: string;
  readonly selectionSetVersion: string;
  readonly shortlistedAt: string | null;
}

export interface CandidateWorkflowObservation extends CandidateWorkflowObservationInput {
  readonly candidateIdentifiersStored: false;
  readonly relationshipNarrativeStored: false;
  readonly safetyTelemetryStored: false;
  readonly schemaVersion: typeof candidateWorkflowObservationSchemaVersion;
}

export interface CandidateWorkflowFunnelSnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly lineage: {
    readonly observationSchemaVersion: typeof candidateWorkflowObservationSchemaVersion;
    readonly policyVersions: readonly string[];
    readonly projectedAt: string;
    readonly projectionSchemaVersion: typeof candidatePurposeProjectionSchemaVersion;
    readonly selectionSetVersions: readonly string[];
    readonly sourceContentStored: false;
  };
  readonly metrics: {
    readonly completeJourneyCount: number;
    readonly dataQualityStateCounts: Readonly<
      Record<CandidateWorkflowDataQualityState, number>
    >;
    readonly deliveredCount: number;
    readonly deliveryRateBasisPoints: number | null;
    readonly firstMeetingCount: number;
    readonly firstMeetingRateBasisPoints: number | null;
    readonly mutualApprovalCount: number;
    readonly mutualApprovalRateBasisPoints: number | null;
    readonly participantAAcceptedCount: number;
    readonly participantAResponseMissingCount: number;
    readonly participantBAcceptedCount: number;
    readonly participantBResponseMissingCount: number;
    readonly reciprocalInterestCount: number;
    readonly reciprocalInterestRateBasisPoints: number | null;
    readonly recommendedCount: number;
    readonly recommendationRateBasisPoints: number | null;
    readonly recordedJourneyCount: number;
    readonly respectfulClosureCount: number;
    readonly reviewedCount: number;
    readonly shortlistedCount: number;
    readonly shortlistRateBasisPoints: number | null;
  } | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateWorkflowFunnelSchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

const inputKeys = [
  "dataQualityState",
  "deliveredAt",
  "firstMeetingState",
  "journeyId",
  "observedAt",
  "participantADecision",
  "participantAFollowupInterest",
  "participantBDecision",
  "participantBFollowupInterest",
  "policyVersion",
  "recommendedAt",
  "respectfulClosureState",
  "reviewedAt",
  "selectionProjectedAt",
  "selectionSetVersion",
  "shortlistedAt",
] as const;
const recordKeys = [
  ...inputKeys,
  "candidateIdentifiersStored",
  "relationshipNarrativeStored",
  "safetyTelemetryStored",
  "schemaVersion",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const dataQualityStates = [
  "backfilled",
  "complete",
  "delayed",
  "invalid-quarantined",
  "partial",
  "stale",
] as const;
const decisions = [
  "accepted",
  "declined",
  "expired",
  "no-response",
  "pending",
] as const;
const interests = [
  "interested",
  "not-interested",
  "not-reported",
  "not-applicable",
] as const;
const meetingStates = [
  "cancelled",
  "not-applicable",
  "not-reported",
  "occurred",
] as const;

export function recordCandidateWorkflowObservation(
  input: unknown,
): CandidateWorkflowObservation {
  if (!isRecord(input) || !hasExactKeys(input, inputKeys)) {
    throw new Error("Candidate workflow observation has unexpected fields");
  }
  const reviewedAt = timestamp(input.reviewedAt, "Review time");
  const shortlistedAt = nullableTimestamp(
    input.shortlistedAt,
    "Shortlist time",
  );
  const recommendedAt = nullableTimestamp(
    input.recommendedAt,
    "Recommendation time",
  );
  const deliveredAt = nullableTimestamp(input.deliveredAt, "Delivery time");
  const observedAt = timestamp(input.observedAt, "Observation time");
  const selectionProjectedAt = timestamp(
    input.selectionProjectedAt,
    "Selection projection time",
  );
  if (selectionProjectedAt > reviewedAt) {
    throw new Error("Selection projection cannot follow workflow review");
  }
  const participantADecision = enumValue(
    input.participantADecision,
    decisions,
    "Participant A decision",
  );
  const participantBDecision = enumValue(
    input.participantBDecision,
    decisions,
    "Participant B decision",
  );
  const firstMeetingState = enumValue(
    input.firstMeetingState,
    meetingStates,
    "First meeting state",
  );
  const participantAFollowupInterest = enumValue(
    input.participantAFollowupInterest,
    interests,
    "Participant A follow-up interest",
  );
  const participantBFollowupInterest = enumValue(
    input.participantBFollowupInterest,
    interests,
    "Participant B follow-up interest",
  );
  validateStageOrder({
    reviewedAt,
    shortlistedAt,
    recommendedAt,
    deliveredAt,
    observedAt,
  });
  validateOutcomeStates({
    deliveredAt,
    firstMeetingState,
    participantADecision,
    participantAFollowupInterest,
    participantBDecision,
    participantBFollowupInterest,
    recommendedAt,
  });

  return {
    candidateIdentifiersStored: false,
    dataQualityState: enumValue(
      input.dataQualityState,
      dataQualityStates,
      "Workflow data-quality state",
    ),
    deliveredAt,
    firstMeetingState,
    journeyId: identifier(input.journeyId, "Journey ID"),
    observedAt,
    participantADecision,
    participantAFollowupInterest,
    participantBDecision,
    participantBFollowupInterest,
    policyVersion: identifier(input.policyVersion, "Policy version"),
    recommendedAt,
    relationshipNarrativeStored: false,
    respectfulClosureState: enumValue(
      input.respectfulClosureState,
      ["open", "recorded"] as const,
      "Respectful closure state",
    ),
    reviewedAt,
    safetyTelemetryStored: false,
    schemaVersion: candidateWorkflowObservationSchemaVersion,
    selectionProjectedAt,
    selectionSetVersion: identifier(
      input.selectionSetVersion,
      "Selection set version",
    ),
    shortlistedAt,
  };
}

export function validateCandidateWorkflowObservation(
  input: unknown,
): CandidateWorkflowObservation {
  if (!isRecord(input) || !hasExactKeys(input, recordKeys)) {
    throw new Error(
      "Candidate workflow observation record has unexpected fields",
    );
  }
  if (
    input.schemaVersion !== candidateWorkflowObservationSchemaVersion ||
    input.candidateIdentifiersStored !== false ||
    input.relationshipNarrativeStored !== false ||
    input.safetyTelemetryStored !== false
  )
    throw new Error("Candidate workflow observation contract is invalid");
  const {
    candidateIdentifiersStored: _candidateIdentifiersStored,
    relationshipNarrativeStored: _relationshipNarrativeStored,
    safetyTelemetryStored: _safetyTelemetryStored,
    schemaVersion: _schemaVersion,
    ...raw
  } = input;
  return recordCandidateWorkflowObservation(raw);
}

export function buildCandidateWorkflowFunnelSnapshot(input: {
  readonly cohortKey: string;
  readonly minimumCohortSize: number;
  readonly observations: readonly CandidateWorkflowObservation[];
  readonly projection: CandidatePurposeProjection;
  readonly windowEnd: string;
  readonly windowStart: string;
}): CandidateWorkflowFunnelSnapshot {
  const windowStart = timestamp(input.windowStart, "Workflow window start");
  const windowEnd = timestamp(input.windowEnd, "Workflow window end");
  if (windowStart >= windowEnd) throw new Error("Workflow window is invalid");
  if (!/^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.cohortKey))
    throw new Error("Workflow cohort key must be opaque");
  if (
    !Number.isSafeInteger(input.minimumCohortSize) ||
    input.minimumCohortSize < 5
  )
    throw new Error("Workflow minimum cohort size must be at least five");
  validateProjection(input.projection, windowStart, windowEnd);
  const observations = input.observations.map(
    validateCandidateWorkflowObservation,
  );
  const journeyIds = new Set<string>();
  const dataQualityStateCounts = emptyQualityCounts();
  for (const observation of observations) {
    if (journeyIds.has(observation.journeyId))
      throw new Error("Candidate workflow funnel contains duplicate journeys");
    journeyIds.add(observation.journeyId);
    if (
      observation.observedAt < windowStart ||
      observation.observedAt > windowEnd
    )
      throw new Error("Candidate workflow observation is outside the window");
    if (observation.selectionProjectedAt !== input.projection.projectedAt)
      throw new Error(
        "Candidate workflow observation has mismatched projection lineage",
      );
    dataQualityStateCounts[observation.dataQualityState] += 1;
  }
  const base: Omit<CandidateWorkflowFunnelSnapshot, "dataState" | "metrics"> = {
    cohortKey: input.cohortKey,
    lineage: {
      observationSchemaVersion: candidateWorkflowObservationSchemaVersion,
      policyVersions: unique(observations.map((item) => item.policyVersion)),
      projectedAt: input.projection.projectedAt,
      projectionSchemaVersion: input.projection.schemaVersion,
      selectionSetVersions: unique(
        observations.map((item) => item.selectionSetVersion),
      ),
      sourceContentStored: false,
    },
    minimumCohortSize: input.minimumCohortSize,
    schemaVersion: candidateWorkflowFunnelSchemaVersion,
    windowEnd,
    windowStart,
  };
  if (
    input.projection.candidateCount < input.minimumCohortSize ||
    observations.length < input.minimumCohortSize
  )
    return { ...base, dataState: "suppressed-small-cohort", metrics: null };

  const complete = observations.filter(
    (item) => item.dataQualityState === "complete",
  );
  const reviewedCount = complete.length;
  const shortlistedCount = count(
    complete,
    (item) => item.shortlistedAt !== null,
  );
  const recommendedCount = count(
    complete,
    (item) => item.recommendedAt !== null,
  );
  const participantAAcceptedCount = count(
    complete,
    (item) => item.participantADecision === "accepted",
  );
  const participantBAcceptedCount = count(
    complete,
    (item) => item.participantBDecision === "accepted",
  );
  const mutualApprovalCount = count(
    complete,
    (item) =>
      item.participantADecision === "accepted" &&
      item.participantBDecision === "accepted",
  );
  const deliveredCount = count(complete, (item) => item.deliveredAt !== null);
  const firstMeetingCount = count(
    complete,
    (item) => item.firstMeetingState === "occurred",
  );
  const reciprocalInterestCount = count(
    complete,
    (item) =>
      item.participantAFollowupInterest === "interested" &&
      item.participantBFollowupInterest === "interested",
  );
  return {
    ...base,
    dataState: "available",
    metrics: {
      completeJourneyCount: complete.length,
      dataQualityStateCounts,
      deliveredCount,
      deliveryRateBasisPoints: ratio(deliveredCount, mutualApprovalCount),
      firstMeetingCount,
      firstMeetingRateBasisPoints: ratio(firstMeetingCount, deliveredCount),
      mutualApprovalCount,
      mutualApprovalRateBasisPoints: ratio(
        mutualApprovalCount,
        recommendedCount,
      ),
      participantAAcceptedCount,
      participantAResponseMissingCount: count(complete, (item) =>
        ["pending", "no-response"].includes(item.participantADecision),
      ),
      participantBAcceptedCount,
      participantBResponseMissingCount: count(complete, (item) =>
        ["pending", "no-response"].includes(item.participantBDecision),
      ),
      reciprocalInterestCount,
      reciprocalInterestRateBasisPoints: ratio(
        reciprocalInterestCount,
        firstMeetingCount,
      ),
      recommendedCount,
      recommendationRateBasisPoints: ratio(recommendedCount, shortlistedCount),
      recordedJourneyCount: observations.length,
      respectfulClosureCount: count(
        complete,
        (item) => item.respectfulClosureState === "recorded",
      ),
      reviewedCount,
      shortlistedCount,
      shortlistRateBasisPoints: ratio(shortlistedCount, reviewedCount),
    },
  };
}

function validateStageOrder(input: {
  reviewedAt: string;
  shortlistedAt: string | null;
  recommendedAt: string | null;
  deliveredAt: string | null;
  observedAt: string;
}): void {
  const stages = [
    input.reviewedAt,
    input.shortlistedAt,
    input.recommendedAt,
    input.deliveredAt,
  ].filter((value): value is string => value !== null);
  if (input.recommendedAt && !input.shortlistedAt)
    throw new Error("Recommendation requires shortlist inclusion");
  if (input.deliveredAt && !input.recommendedAt)
    throw new Error("Delivery requires a recommendation");
  for (let index = 1; index < stages.length; index += 1)
    if (stages[index]! < stages[index - 1]!)
      throw new Error("Workflow stages must be chronological");
  if (stages.some((stage) => stage > input.observedAt))
    throw new Error("Workflow stage cannot follow observation time");
}

function validateOutcomeStates(input: {
  deliveredAt: string | null;
  firstMeetingState: FirstMeetingState;
  participantADecision: ParticipantIntroductionDecision;
  participantAFollowupInterest: ParticipantFollowupInterest;
  participantBDecision: ParticipantIntroductionDecision;
  participantBFollowupInterest: ParticipantFollowupInterest;
  recommendedAt: string | null;
}): void {
  const hasDecision =
    input.participantADecision !== "pending" ||
    input.participantBDecision !== "pending";
  if (hasDecision && !input.recommendedAt)
    throw new Error("Participant decisions require a recommendation");
  if (
    input.deliveredAt &&
    (input.participantADecision !== "accepted" ||
      input.participantBDecision !== "accepted")
  )
    throw new Error("Delivery requires independent mutual approval");
  if (input.firstMeetingState !== "not-applicable" && !input.deliveredAt)
    throw new Error("First-meeting state requires delivery");
  const hasFollowup =
    input.participantAFollowupInterest !== "not-applicable" ||
    input.participantBFollowupInterest !== "not-applicable";
  if (hasFollowup && input.firstMeetingState !== "occurred")
    throw new Error("Follow-up interest requires a first meeting");
  if (
    input.firstMeetingState === "occurred" &&
    (input.participantAFollowupInterest === "not-applicable" ||
      input.participantBFollowupInterest === "not-applicable")
  ) {
    throw new Error(
      "A completed first meeting requires explicit or not-reported follow-up states",
    );
  }
}

function validateProjection(
  projection: CandidatePurposeProjection,
  start: string,
  end: string,
): void {
  if (
    projection.schemaVersion !== candidatePurposeProjectionSchemaVersion ||
    projection.purpose !== "matchmaker-discovery" ||
    projection.role !== "matchmaker" ||
    !projection.approvedAssertionsOnly ||
    projection.rawSourceIncluded
  )
    throw new Error(
      "Workflow funnel requires an approved discovery projection",
    );
  if (
    !Number.isSafeInteger(projection.candidateCount) ||
    projection.candidateCount < 0
  )
    throw new Error("Workflow projection candidate count is invalid");
  if (projection.projectedAt < start || projection.projectedAt > end)
    throw new Error("Workflow projection is outside the window");
}

function emptyQualityCounts(): Record<
  CandidateWorkflowDataQualityState,
  number
> {
  return {
    backfilled: 0,
    complete: 0,
    delayed: 0,
    "invalid-quarantined": 0,
    partial: 0,
    stale: 0,
  };
}
function count<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): number {
  return items.filter(predicate).length;
}
function ratio(numerator: number, denominator: number): number | null {
  return denominator === 0
    ? null
    : Math.round((numerator * 10_000) / denominator);
}
function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}
function nullableTimestamp(value: unknown, label: string): string | null {
  return value === null ? null : timestamp(value, label);
}
function timestamp(value: unknown, label: string): string {
  if (typeof value !== "string")
    throw new Error(`${label} must be an ISO timestamp`);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value)
    throw new Error(`${label} must be a normalized ISO timestamp`);
  return value;
}
function identifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value))
    throw new Error(`${label} must be a lowercase identifier`);
  return value;
}
function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T {
  if (typeof value !== "string" || !allowed.includes(value as T))
    throw new Error(`${label} is not supported`);
  return value as T;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}
