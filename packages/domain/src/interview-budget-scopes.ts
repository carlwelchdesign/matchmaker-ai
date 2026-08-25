import type {
  InterviewUsageEnvironment,
  InterviewUsageExecution,
  InterviewUsageMode,
} from "./interview-usage.js";
import { validateInterviewUsageExecution } from "./interview-usage.js";

export type InterviewBudgetDimension =
  "candidate" | "cohort" | "day" | "environment" | "mode" | "provider";

export interface InterviewBudgetAttribution {
  readonly candidateBudgetKey: string;
  readonly cohortBudgetKey: string;
  readonly execution: InterviewUsageExecution;
}

export interface InterviewBudgetRule {
  readonly alertAtBasisPoints: number;
  readonly dimension: InterviewBudgetDimension;
  readonly maxEstimatedCostMicrousd: number;
  readonly maxExecutions: number;
  readonly ruleId: string;
  readonly value: string;
}

export interface InterviewBudgetAlert {
  readonly dimension: InterviewBudgetDimension;
  readonly estimatedCostMicrousd: number;
  readonly executionCount: number;
  readonly ruleId: string;
  readonly status: "exceeded" | "warning";
  readonly value: string;
}

export type ScopedInterviewBudgetDecision = {
  readonly action: "allow" | "structured-fallback";
  readonly alerts: readonly InterviewBudgetAlert[];
};

const attributionKeys = [
  "candidateBudgetKey",
  "cohortBudgetKey",
  "execution",
] as const;
const ruleKeys = [
  "alertAtBasisPoints",
  "dimension",
  "maxEstimatedCostMicrousd",
  "maxExecutions",
  "ruleId",
  "value",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validDimensions = new Set<InterviewBudgetDimension>([
  "candidate",
  "cohort",
  "day",
  "environment",
  "mode",
  "provider",
]);
const validEnvironments = new Set<InterviewUsageEnvironment>([
  "development",
  "preview",
  "production",
  "test",
]);
const validModes = new Set<InterviewUsageMode>([
  "hybrid",
  "structured",
  "typed-conversation",
  "voice",
]);

export function createInterviewBudgetAttribution(
  input: unknown,
): InterviewBudgetAttribution {
  if (!isRecord(input) || !hasExactKeys(input, attributionKeys)) {
    throw new Error("Interview budget attribution has unexpected fields");
  }
  const execution = validateInterviewUsageExecution(input.execution);

  return {
    candidateBudgetKey: requireIdentifier(
      input.candidateBudgetKey,
      "Candidate budget key",
    ),
    cohortBudgetKey: requireIdentifier(
      input.cohortBudgetKey,
      "Cohort budget key",
    ),
    execution,
  };
}

export function createInterviewBudgetRule(input: unknown): InterviewBudgetRule {
  if (!isRecord(input) || !hasExactKeys(input, ruleKeys)) {
    throw new Error("Interview budget rule has unexpected fields");
  }
  const dimension = requireDimension(input.dimension);
  const value = requireRuleValue(dimension, input.value);
  const alertAtBasisPoints = requireNonNegativeInteger(
    input.alertAtBasisPoints,
    "Alert threshold",
  );
  if (alertAtBasisPoints < 1 || alertAtBasisPoints > 10_000) {
    throw new Error("Alert threshold must be between 1 and 10000 basis points");
  }

  return {
    alertAtBasisPoints,
    dimension,
    maxEstimatedCostMicrousd: requireNonNegativeInteger(
      input.maxEstimatedCostMicrousd,
      "Cost budget",
    ),
    maxExecutions: requireNonNegativeInteger(
      input.maxExecutions,
      "Execution budget",
    ),
    ruleId: requireIdentifier(input.ruleId, "Budget rule ID"),
    value,
  };
}

export function evaluateScopedInterviewBudgets(
  input: Readonly<{
    history: readonly InterviewBudgetAttribution[];
    proposed: InterviewBudgetAttribution;
    rules: readonly InterviewBudgetRule[];
  }>,
): ScopedInterviewBudgetDecision {
  validateUniqueIds(input);
  const entries = [...input.history, input.proposed];
  const alerts = input.rules.flatMap((rule) => {
    if (!matchesRule(input.proposed, rule)) return [];
    const matchingEntries = entries.filter((entry) => matchesRule(entry, rule));
    const executionCount = matchingEntries.length;
    const estimatedCostMicrousd = matchingEntries.reduce(
      (total, entry) => total + entry.execution.estimatedCostMicrousd,
      0,
    );
    const exceeded =
      executionCount > rule.maxExecutions ||
      estimatedCostMicrousd > rule.maxEstimatedCostMicrousd;
    const warning =
      reachedThreshold(
        executionCount,
        rule.maxExecutions,
        rule.alertAtBasisPoints,
      ) ||
      reachedThreshold(
        estimatedCostMicrousd,
        rule.maxEstimatedCostMicrousd,
        rule.alertAtBasisPoints,
      );
    if (!exceeded && !warning) return [];

    return [
      {
        dimension: rule.dimension,
        estimatedCostMicrousd,
        executionCount,
        ruleId: rule.ruleId,
        status: exceeded ? ("exceeded" as const) : ("warning" as const),
        value: rule.value,
      },
    ];
  });

  return {
    action: alerts.some((alert) => alert.status === "exceeded")
      ? "structured-fallback"
      : "allow",
    alerts,
  };
}

function matchesRule(
  attribution: InterviewBudgetAttribution,
  rule: InterviewBudgetRule,
): boolean {
  if (rule.dimension === "candidate") {
    return attribution.candidateBudgetKey === rule.value;
  }
  if (rule.dimension === "cohort") {
    return attribution.cohortBudgetKey === rule.value;
  }
  if (rule.dimension === "day") {
    return attribution.execution.occurredAt.slice(0, 10) === rule.value;
  }
  if (rule.dimension === "environment") {
    return attribution.execution.environment === rule.value;
  }
  if (rule.dimension === "mode") {
    return attribution.execution.mode === rule.value;
  }
  return providerBudgetValue(attribution.execution) === rule.value;
}

function providerBudgetValue(execution: InterviewUsageExecution): string {
  return execution.provider ?? "deterministic-template";
}

function reachedThreshold(
  usage: number,
  maximum: number,
  basisPoints: number,
): boolean {
  if (maximum === 0) return usage > 0;
  return usage >= Math.ceil((maximum * basisPoints) / 10_000);
}

function validateUniqueIds(
  input: Readonly<{
    history: readonly InterviewBudgetAttribution[];
    proposed: InterviewBudgetAttribution;
    rules: readonly InterviewBudgetRule[];
  }>,
): void {
  const executionIds = new Set(
    input.history.map((entry) => entry.execution.executionId),
  );
  if (
    executionIds.size !== input.history.length ||
    executionIds.has(input.proposed.execution.executionId)
  ) {
    throw new Error("Scoped interview budget contains duplicate executions");
  }
  const ruleIds = new Set(input.rules.map((rule) => rule.ruleId));
  if (ruleIds.size !== input.rules.length) {
    throw new Error("Scoped interview budget contains duplicate rules");
  }
}

function requireDimension(value: unknown): InterviewBudgetDimension {
  if (
    typeof value === "string" &&
    validDimensions.has(value as InterviewBudgetDimension)
  ) {
    return value as InterviewBudgetDimension;
  }
  throw new Error("Budget dimension is invalid");
}

function requireRuleValue(
  dimension: InterviewBudgetDimension,
  value: unknown,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Budget rule value is required");
  }
  const normalized = value.trim();
  if (
    (dimension === "candidate" || dimension === "cohort") &&
    !identifierPattern.test(normalized)
  ) {
    throw new Error("Candidate and cohort budgets require opaque identifiers");
  }
  if (dimension === "day") {
    const parsed = new Date(`${normalized}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(normalized) ||
      Number.isNaN(parsed.valueOf()) ||
      parsed.toISOString().slice(0, 10) !== normalized
    ) {
      throw new Error("Day budget requires a valid ISO date");
    }
  }
  if (
    dimension === "environment" &&
    !validEnvironments.has(normalized as InterviewUsageEnvironment)
  ) {
    throw new Error("Environment budget value is invalid");
  }
  if (
    dimension === "mode" &&
    !validModes.has(normalized as InterviewUsageMode)
  ) {
    throw new Error("Mode budget value is invalid");
  }
  return normalized;
}

function requireIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be an opaque lowercase identifier`);
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
