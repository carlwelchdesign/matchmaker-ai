import {
  candidateDashboardDenominatorKindForMetric,
  candidateDashboardMetricContractForMetric,
  candidateDashboardMetricKeys,
  candidateDashboardMetricSetSchemaVersion,
  type CandidateDashboardMetricSet,
} from "./candidate-dashboard-metrics.js";

export const candidateDashboardAccessDecisionSchemaVersion =
  "candidate-dashboard-access-decision/v1" as const;

export type CandidateDashboardAudience = "internal-staff" | "partner-report";
export type CandidateDashboardViewerRole =
  "data-analyst" | "matchmaker" | "partner";
export type CandidateDashboardAccessReason =
  | "authorized"
  | "audience-not-authorized"
  | "cohort-not-authorized"
  | "role-not-authorized";

export interface CandidateDashboardAccessRequest {
  readonly accessedAt: string;
  readonly allowedCohortKeys: readonly string[];
  readonly audience: CandidateDashboardAudience;
  readonly role: CandidateDashboardViewerRole;
}

export type CandidateDashboardAccessDecision =
  | {
      readonly authorized: true;
      readonly dashboard: CandidateDashboardMetricSet;
      readonly partnerValuesExposed: false;
      readonly reason: "authorized";
      readonly schemaVersion: typeof candidateDashboardAccessDecisionSchemaVersion;
      readonly smallCohortValuesExposed: false;
    }
  | {
      readonly authorized: false;
      readonly dashboard: null;
      readonly partnerValuesExposed: false;
      readonly reason: Exclude<CandidateDashboardAccessReason, "authorized">;
      readonly schemaVersion: typeof candidateDashboardAccessDecisionSchemaVersion;
      readonly smallCohortValuesExposed: false;
    };

const cohortKeyPattern = /^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const authorizedRoles = new Set<CandidateDashboardViewerRole>([
  "data-analyst",
  "matchmaker",
]);

export function authorizeCandidateDashboardMetricSet(
  dashboard: CandidateDashboardMetricSet,
  request: CandidateDashboardAccessRequest,
): CandidateDashboardAccessDecision {
  validateDashboard(dashboard);
  const accessedAt = timestamp(request.accessedAt, "Dashboard access time");
  if (accessedAt < dashboard.generatedAt) {
    throw new Error("Dashboard access cannot predate dashboard generation");
  }
  const allowedCohortKeys = validateAllowedCohorts(request.allowedCohortKeys);

  if (request.audience !== "internal-staff") {
    return denied("audience-not-authorized");
  }
  if (!authorizedRoles.has(request.role)) {
    return denied("role-not-authorized");
  }
  if (!allowedCohortKeys.has(dashboard.cohortKey)) {
    return denied("cohort-not-authorized");
  }

  return {
    authorized: true,
    dashboard,
    partnerValuesExposed: false,
    reason: "authorized",
    schemaVersion: candidateDashboardAccessDecisionSchemaVersion,
    smallCohortValuesExposed: false,
  };
}

function denied(
  reason: Exclude<CandidateDashboardAccessReason, "authorized">,
): CandidateDashboardAccessDecision {
  return {
    authorized: false,
    dashboard: null,
    partnerValuesExposed: false,
    reason,
    schemaVersion: candidateDashboardAccessDecisionSchemaVersion,
    smallCohortValuesExposed: false,
  };
}

function validateAllowedCohorts(values: readonly string[]): Set<string> {
  if (values.length === 0) {
    throw new Error("Dashboard access requires an allowed cohort");
  }
  const unique = new Set(values);
  if (unique.size !== values.length) {
    throw new Error("Dashboard allowed cohorts must be unique");
  }
  for (const value of values) {
    if (!cohortKeyPattern.test(value)) {
      throw new Error("Dashboard allowed cohort key must be opaque");
    }
  }
  return unique;
}

function validateDashboard(dashboard: CandidateDashboardMetricSet): void {
  if (dashboard.schemaVersion !== candidateDashboardMetricSetSchemaVersion) {
    throw new Error("Dashboard schema version is not supported");
  }
  if (
    dashboard.candidateIdentifiersStored !== false ||
    dashboard.sourceContentStored !== false
  ) {
    throw new Error("Dashboard contains prohibited candidate content");
  }
  if (
    dashboard.dataBoundary?.productAnalyticsOnly !== true ||
    dashboard.dataBoundary.legalAuditEvidenceStored !== false ||
    dashboard.dataBoundary.operationalRecordsStored !== false ||
    dashboard.dataBoundary.providerPayloadsStored !== false ||
    dashboard.dataBoundary.securityTelemetryStored !== false
  ) {
    throw new Error("Dashboard violates the product analytics data boundary");
  }
  if (!cohortKeyPattern.test(dashboard.cohortKey)) {
    throw new Error("Dashboard cohort key must be opaque");
  }
  const generatedAt = timestamp(
    dashboard.generatedAt,
    "Dashboard generation time",
  );
  const windowStart = timestamp(
    dashboard.windowStart,
    "Dashboard window start",
  );
  const windowEnd = timestamp(dashboard.windowEnd, "Dashboard window end");
  if (
    windowStart >= windowEnd ||
    generatedAt < windowStart ||
    generatedAt > windowEnd
  ) {
    throw new Error("Dashboard time scope is invalid");
  }

  const metricKeys = new Set<string>();
  if (dashboard.metrics.length !== candidateDashboardMetricKeys.length) {
    throw new Error("Dashboard metric set is incomplete");
  }
  for (const metric of dashboard.metrics) {
    if (metricKeys.has(metric.key)) {
      throw new Error("Dashboard metric keys must be unique");
    }
    metricKeys.add(metric.key);
    const contract = candidateDashboardMetricContractForMetric(metric.key);
    if (
      metric.unit !== contract.unit ||
      metric.lineage.source !== contract.source ||
      metric.lineage.sourceSchemaVersion !== contract.sourceSchemaVersion
    ) {
      throw new Error("Dashboard metric contract does not match its key");
    }
    if (
      metric.lineage.cohortKey !== dashboard.cohortKey ||
      metric.lineage.windowStart !== dashboard.windowStart ||
      metric.lineage.windowEnd !== dashboard.windowEnd
    ) {
      throw new Error("Dashboard metric scope does not match the dashboard");
    }
    if (
      (metric.lineage.sourceAsOf === null) !==
      (metric.freshness === "unknown")
    ) {
      throw new Error(
        "Dashboard metric freshness and source timestamp disagree",
      );
    }
    if (metric.lineage.sourceAsOf !== null) {
      const sourceAsOf = timestamp(
        metric.lineage.sourceAsOf,
        "Dashboard metric source time",
      );
      if (sourceAsOf > generatedAt) {
        throw new Error(
          "Dashboard metric source cannot be newer than dashboard",
        );
      }
    }
    const hasValue = metric.value !== null;
    if ((metric.missingDataState === "available") !== hasValue) {
      throw new Error("Dashboard metric value and missing-data state disagree");
    }
    if (
      hasValue &&
      (!Number.isSafeInteger(metric.value) ||
        metric.value < 0 ||
        (metric.unit === "basis-points" && metric.value > 10_000))
    ) {
      throw new Error("Dashboard metric value is invalid");
    }
    validateMetricCalculation(metric);
  }
  if (
    candidateDashboardMetricKeys.some((metricKey) => !metricKeys.has(metricKey))
  ) {
    throw new Error("Dashboard metric set is incomplete");
  }
}

function validateMetricCalculation(
  metric: CandidateDashboardMetricSet["metrics"][number],
): void {
  if (metric.unit !== "count" && metric.unit !== "basis-points") {
    throw new Error("Dashboard metric unit is invalid");
  }
  const calculation = metric.calculation;
  if (
    !calculation ||
    (calculation.numerator !== null &&
      (!Number.isSafeInteger(calculation.numerator) ||
        calculation.numerator < 0)) ||
    (calculation.denominator !== null &&
      (!Number.isSafeInteger(calculation.denominator) ||
        calculation.denominator < 0))
  ) {
    throw new Error("Dashboard metric calculation is invalid");
  }
  if (
    calculation.denominatorKind !==
    candidateDashboardDenominatorKindForMetric(metric.key)
  ) {
    throw new Error("Dashboard metric denominator kind is invalid");
  }
  if (metric.unit === "count") {
    if (
      calculation.denominatorKind !== "not-applicable" ||
      calculation.denominator !== null ||
      calculation.numerator !== metric.value ||
      metric.missingDataState === "missing-denominator"
    ) {
      throw new Error("Dashboard count metric calculation is invalid");
    }
    return;
  }
  if (calculation.denominatorKind === "not-applicable") {
    throw new Error("Dashboard ratio metric denominator is invalid");
  }
  if (metric.missingDataState === "available") {
    if (
      calculation.numerator === null ||
      calculation.denominator === null ||
      calculation.denominator === 0 ||
      metric.value !==
        Math.round((calculation.numerator * 10_000) / calculation.denominator)
    ) {
      throw new Error("Dashboard ratio metric calculation is inconsistent");
    }
    return;
  }
  if (metric.missingDataState === "missing-denominator") {
    if (calculation.numerator === null || calculation.denominator !== 0) {
      throw new Error("Dashboard missing denominator is inconsistent");
    }
    return;
  }
  if (calculation.numerator !== null || calculation.denominator !== null) {
    throw new Error("Dashboard unavailable calculation is inconsistent");
  }
}

function timestamp(value: string, label: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}
