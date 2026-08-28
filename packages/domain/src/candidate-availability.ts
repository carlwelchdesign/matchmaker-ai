export const candidateAvailabilityObservationSchemaVersion =
  "candidate-availability-observation/v1" as const;
export const candidateAvailabilitySnapshotSchemaVersion =
  "candidate-availability-snapshot/v1" as const;

export type CandidateAvailabilityState =
  "available" | "not-available" | "paused" | "withdrawn";

export type CandidateAvailabilityMetricState =
  CandidateAvailabilityState | "stale" | "unknown";

export interface CandidateAvailabilityObservationInput {
  readonly availabilityId: string;
  readonly candidateId: string;
  readonly confirmedAt: string;
  readonly effectiveAt: string;
  readonly freshUntil: string;
  readonly state: CandidateAvailabilityState;
}

export interface CandidateAvailabilityObservation extends CandidateAvailabilityObservationInput {
  readonly candidateConfirmed: true;
  readonly discoveryEligibilityGranted: false;
  readonly interviewContentStored: false;
  readonly schemaVersion: typeof candidateAvailabilityObservationSchemaVersion;
}

export interface CandidateAvailabilitySnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly evaluatedAt: string;
  readonly lineage: {
    readonly admissionDecisionGranted: false;
    readonly candidateConfirmedOnly: true;
    readonly discoveryEligibilityGranted: false;
    readonly interviewContentStored: false;
    readonly observationSchemaVersion: typeof candidateAvailabilityObservationSchemaVersion;
  };
  readonly metrics: {
    readonly availableCandidateCount: number;
    readonly availableCandidateShareBasisPoints: number;
    readonly candidateCount: number;
    readonly knownAvailabilityCount: number;
    readonly knownAvailabilityShareBasisPoints: number;
    readonly stateCounts: Readonly<
      Record<CandidateAvailabilityMetricState, number>
    >;
  } | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateAvailabilitySnapshotSchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

const observationInputKeys = [
  "availabilityId",
  "candidateId",
  "confirmedAt",
  "effectiveAt",
  "freshUntil",
  "state",
] as const;
const observationKeys = [
  ...observationInputKeys,
  "candidateConfirmed",
  "discoveryEligibilityGranted",
  "interviewContentStored",
  "schemaVersion",
] as const;
const availabilityStates = [
  "available",
  "not-available",
  "paused",
  "withdrawn",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cohortKeyPattern = /^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function recordCandidateAvailabilityObservation(
  input: unknown,
): CandidateAvailabilityObservation {
  if (!isRecord(input) || !hasExactKeys(input, observationInputKeys)) {
    throw new Error("Candidate availability observation has unexpected fields");
  }
  const confirmedAt = timestamp(
    input.confirmedAt,
    "Availability confirmation time",
  );
  const effectiveAt = timestamp(
    input.effectiveAt,
    "Availability effective time",
  );
  const freshUntil = timestamp(input.freshUntil, "Availability freshness time");
  if (effectiveAt > confirmedAt) {
    throw new Error(
      "Candidate availability cannot take effect after confirmation",
    );
  }
  if (freshUntil <= confirmedAt) {
    throw new Error(
      "Candidate availability freshness must follow confirmation",
    );
  }

  return {
    availabilityId: identifier(input.availabilityId, "Availability ID"),
    candidateConfirmed: true,
    candidateId: identifier(input.candidateId, "Candidate ID"),
    confirmedAt,
    discoveryEligibilityGranted: false,
    effectiveAt,
    freshUntil,
    interviewContentStored: false,
    schemaVersion: candidateAvailabilityObservationSchemaVersion,
    state: enumValue(input.state, availabilityStates, "Availability state"),
  };
}

export function validateCandidateAvailabilityObservation(
  input: unknown,
): CandidateAvailabilityObservation {
  if (!isRecord(input) || !hasExactKeys(input, observationKeys)) {
    throw new Error(
      "Candidate availability observation record has unexpected fields",
    );
  }
  if (
    input.schemaVersion !== candidateAvailabilityObservationSchemaVersion ||
    input.candidateConfirmed !== true ||
    input.discoveryEligibilityGranted !== false ||
    input.interviewContentStored !== false
  ) {
    throw new Error("Candidate availability observation contract is invalid");
  }
  const {
    candidateConfirmed: _candidateConfirmed,
    discoveryEligibilityGranted: _discoveryEligibilityGranted,
    interviewContentStored: _interviewContentStored,
    schemaVersion: _schemaVersion,
    ...raw
  } = input;
  return recordCandidateAvailabilityObservation(raw);
}

export function buildCandidateAvailabilitySnapshot(input: {
  readonly candidateIds: readonly string[];
  readonly cohortKey: string;
  readonly evaluatedAt: string;
  readonly minimumCohortSize: number;
  readonly observations: readonly CandidateAvailabilityObservation[];
  readonly windowEnd: string;
  readonly windowStart: string;
}): CandidateAvailabilitySnapshot {
  const evaluatedAt = timestamp(
    input.evaluatedAt,
    "Availability evaluation time",
  );
  const windowStart = timestamp(input.windowStart, "Availability window start");
  const windowEnd = timestamp(input.windowEnd, "Availability window end");
  if (windowStart >= windowEnd)
    throw new Error("Availability window is invalid");
  if (evaluatedAt < windowStart || evaluatedAt > windowEnd) {
    throw new Error("Availability evaluation must fall inside the window");
  }
  if (!cohortKeyPattern.test(input.cohortKey)) {
    throw new Error("Availability cohort key must be opaque");
  }
  if (
    !Number.isSafeInteger(input.minimumCohortSize) ||
    input.minimumCohortSize < 5
  ) {
    throw new Error("Availability minimum cohort size must be at least five");
  }

  const candidateIds = input.candidateIds.map((candidateId) =>
    identifier(candidateId, "Candidate ID"),
  );
  const candidateIdSet = new Set(candidateIds);
  if (candidateIdSet.size !== candidateIds.length) {
    throw new Error(
      "Candidate availability cohort contains duplicate candidates",
    );
  }

  const latestByCandidate = new Map<string, CandidateAvailabilityObservation>();
  const availabilityIds = new Set<string>();
  for (const observationInput of input.observations) {
    const observation =
      validateCandidateAvailabilityObservation(observationInput);
    if (availabilityIds.has(observation.availabilityId)) {
      throw new Error("Candidate availability contains duplicate observations");
    }
    availabilityIds.add(observation.availabilityId);
    if (!candidateIdSet.has(observation.candidateId)) {
      throw new Error(
        "Candidate availability observation is outside the cohort",
      );
    }
    if (observation.confirmedAt > evaluatedAt) {
      throw new Error("Candidate availability observation follows evaluation");
    }
    const previous = latestByCandidate.get(observation.candidateId);
    if (previous && previous.confirmedAt === observation.confirmedAt) {
      throw new Error(
        "Candidate availability has ambiguous current observations",
      );
    }
    if (!previous || previous.confirmedAt < observation.confirmedAt) {
      latestByCandidate.set(observation.candidateId, observation);
    }
  }

  const base: Omit<CandidateAvailabilitySnapshot, "dataState" | "metrics"> = {
    cohortKey: input.cohortKey,
    evaluatedAt,
    lineage: {
      admissionDecisionGranted: false,
      candidateConfirmedOnly: true,
      discoveryEligibilityGranted: false,
      interviewContentStored: false,
      observationSchemaVersion: candidateAvailabilityObservationSchemaVersion,
    },
    minimumCohortSize: input.minimumCohortSize,
    schemaVersion: candidateAvailabilitySnapshotSchemaVersion,
    windowEnd,
    windowStart,
  };
  if (candidateIds.length < input.minimumCohortSize) {
    return { ...base, dataState: "suppressed-small-cohort", metrics: null };
  }

  const stateCounts = emptyStateCounts();
  for (const candidateId of candidateIds) {
    const latest = latestByCandidate.get(candidateId);
    const state = !latest
      ? "unknown"
      : latest.state !== "withdrawn" && latest.freshUntil < evaluatedAt
        ? "stale"
        : latest.state;
    stateCounts[state] += 1;
  }
  const knownAvailabilityCount =
    candidateIds.length - stateCounts.unknown - stateCounts.stale;

  return {
    ...base,
    dataState: "available",
    metrics: {
      availableCandidateCount: stateCounts.available,
      availableCandidateShareBasisPoints: ratio(
        stateCounts.available,
        candidateIds.length,
      ),
      candidateCount: candidateIds.length,
      knownAvailabilityCount,
      knownAvailabilityShareBasisPoints: ratio(
        knownAvailabilityCount,
        candidateIds.length,
      ),
      stateCounts,
    },
  };
}

function emptyStateCounts(): Record<CandidateAvailabilityMetricState, number> {
  return {
    available: 0,
    "not-available": 0,
    paused: 0,
    stale: 0,
    unknown: 0,
    withdrawn: 0,
  };
}

function ratio(numerator: number, denominator: number): number {
  return Math.round((numerator * 10_000) / denominator);
}

function identifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be an opaque identifier`);
  }
  return value;
}

function timestamp(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}

function enumValue<const T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    throw new Error(`${label} is not supported`);
  }
  return value as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return (
    actual.length === wanted.length &&
    actual.every((key, index) => key === wanted[index])
  );
}
