import type { InterviewUnitEconomicsReport } from "./interview-unit-economics.js";

export const interviewOperatingCostSchemaVersion =
  "interview-operating-cost/v1" as const;
export const interviewOperatingCostReportSchemaVersion =
  "interview-operating-cost-report/v1" as const;
export const interviewFullyLoadedEconomicsSchemaVersion =
  "interview-fully-loaded-economics/v1" as const;

export type InterviewOperatingCostCategory =
  "evaluation" | "payment" | "storage" | "support";
export type InterviewOperatingCostKind =
  "labor" | "one-time-purchase" | "subscription" | "usage";
export type InterviewBillingCadence =
  "annual" | "hourly" | "monthly" | "one-time" | "usage";
export type InterviewCostMeasurementBasis = "actual" | "estimate";
export type InterviewSubscriptionStatus =
  "active" | "canceled" | "not-applicable" | "trial";

export interface InterviewOperatingCostInput {
  readonly amountMicrousd: number;
  readonly approvalKey: string | null;
  readonly billingCadence: InterviewBillingCadence;
  readonly category: InterviewOperatingCostCategory;
  readonly costKind: InterviewOperatingCostKind;
  readonly entryId: string;
  readonly evidenceKey: string | null;
  readonly incurredAt: string;
  readonly measurementBasis: InterviewCostMeasurementBasis;
  readonly paymentSourceKey: string | null;
  readonly serviceKey: string;
  readonly subscriptionKey: string | null;
  readonly subscriptionStatus: InterviewSubscriptionStatus;
  readonly vendorKey: string;
}

export interface InterviewOperatingCost extends InterviewOperatingCostInput {
  readonly paymentCredentialsStored: false;
  readonly schemaVersion: typeof interviewOperatingCostSchemaVersion;
}

export interface InterviewOperatingCostReport {
  readonly activeSubscriptionKeys: readonly string[];
  readonly actualCostMicrousd: number;
  readonly costByCategoryMicrousd: Readonly<
    Record<InterviewOperatingCostCategory, number>
  >;
  readonly costByKindMicrousd: Readonly<
    Record<InterviewOperatingCostKind, number>
  >;
  readonly estimatedCostMicrousd: number;
  readonly paymentCredentialsStored: false;
  readonly purchaseCount: number;
  readonly schemaVersion: typeof interviewOperatingCostReportSchemaVersion;
  readonly subscriptionChargeCount: number;
  readonly totalOperatingCostMicrousd: number;
}

export interface InterviewFullyLoadedEconomicsReport {
  readonly apiEstimatedCostMicrousd: number;
  readonly estimatedCostMicrousdPerApprovedField: number | null;
  readonly estimatedCostMicrousdPerCompletion: number | null;
  readonly estimatedCostMicrousdPerCorrection: number | null;
  readonly estimatedCostMicrousdPerHumanReviewMinuteSaved: number | null;
  readonly estimatedCostMicrousdPerStart: number | null;
  readonly operatingCostMicrousd: number;
  readonly paymentCredentialsStored: false;
  readonly schemaVersion: typeof interviewFullyLoadedEconomicsSchemaVersion;
  readonly totalFullyLoadedEstimatedCostMicrousd: number;
}

const costInputKeys = [
  "amountMicrousd",
  "approvalKey",
  "billingCadence",
  "category",
  "costKind",
  "entryId",
  "evidenceKey",
  "incurredAt",
  "measurementBasis",
  "paymentSourceKey",
  "serviceKey",
  "subscriptionKey",
  "subscriptionStatus",
  "vendorKey",
] as const;
const costKeys = [
  ...costInputKeys,
  "paymentCredentialsStored",
  "schemaVersion",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categories = new Set<InterviewOperatingCostCategory>([
  "evaluation",
  "payment",
  "storage",
  "support",
]);
const costKinds = new Set<InterviewOperatingCostKind>([
  "labor",
  "one-time-purchase",
  "subscription",
  "usage",
]);
const billingCadences = new Set<InterviewBillingCadence>([
  "annual",
  "hourly",
  "monthly",
  "one-time",
  "usage",
]);
const measurementBases = new Set<InterviewCostMeasurementBasis>([
  "actual",
  "estimate",
]);
const subscriptionStatuses = new Set<InterviewSubscriptionStatus>([
  "active",
  "canceled",
  "not-applicable",
  "trial",
]);

export function recordInterviewOperatingCost(
  input: unknown,
): InterviewOperatingCost {
  if (!isRecord(input) || !hasExactKeys(input, costInputKeys)) {
    throw new Error(
      "Interview operating cost rejected: unexpected or missing fields",
    );
  }

  const cost: InterviewOperatingCost = {
    amountMicrousd: requireNonNegativeInteger(
      input.amountMicrousd,
      "Operating cost",
    ),
    approvalKey: requireNullableIdentifier(input.approvalKey, "Approval key"),
    billingCadence: requireEnum(
      input.billingCadence,
      billingCadences,
      "Billing cadence",
    ),
    category: requireEnum(input.category, categories, "Cost category"),
    costKind: requireEnum(input.costKind, costKinds, "Cost kind"),
    entryId: requireIdentifier(input.entryId, "Cost entry ID"),
    evidenceKey: requireNullableIdentifier(input.evidenceKey, "Evidence key"),
    incurredAt: requireIsoTimestamp(input.incurredAt, "Incurred at"),
    measurementBasis: requireEnum(
      input.measurementBasis,
      measurementBases,
      "Measurement basis",
    ),
    paymentCredentialsStored: false,
    paymentSourceKey: requireNullableIdentifier(
      input.paymentSourceKey,
      "Payment source key",
    ),
    schemaVersion: interviewOperatingCostSchemaVersion,
    serviceKey: requireIdentifier(input.serviceKey, "Service key"),
    subscriptionKey: requireNullableIdentifier(
      input.subscriptionKey,
      "Subscription key",
    ),
    subscriptionStatus: requireEnum(
      input.subscriptionStatus,
      subscriptionStatuses,
      "Subscription status",
    ),
    vendorKey: requireIdentifier(input.vendorKey, "Vendor key"),
  };

  validateCostEvidence(cost);
  validateCostKind(cost);
  return cost;
}

export function validateInterviewOperatingCost(
  input: unknown,
): InterviewOperatingCost {
  if (!isRecord(input) || !hasExactKeys(input, costKeys)) {
    throw new Error(
      "Interview operating cost record has unexpected or missing fields",
    );
  }
  if (
    input.schemaVersion !== interviewOperatingCostSchemaVersion ||
    input.paymentCredentialsStored !== false
  ) {
    throw new Error("Interview operating cost record contract is invalid");
  }

  const {
    paymentCredentialsStored: _paymentCredentialsStored,
    schemaVersion: _schemaVersion,
    ...raw
  } = input;
  return recordInterviewOperatingCost(raw);
}

export function buildInterviewOperatingCostReport(
  entries: readonly InterviewOperatingCost[],
): InterviewOperatingCostReport {
  const validated = entries.map(validateInterviewOperatingCost);
  const entryIds = new Set(validated.map((entry) => entry.entryId));
  if (entryIds.size !== validated.length) {
    throw new Error("Interview operating costs contain duplicate entries");
  }

  const costByCategoryMicrousd = {
    evaluation: 0,
    payment: 0,
    storage: 0,
    support: 0,
  } satisfies Record<InterviewOperatingCostCategory, number>;
  const costByKindMicrousd = {
    labor: 0,
    "one-time-purchase": 0,
    subscription: 0,
    usage: 0,
  } satisfies Record<InterviewOperatingCostKind, number>;
  let actualCostMicrousd = 0;
  let estimatedCostMicrousd = 0;

  for (const entry of validated) {
    costByCategoryMicrousd[entry.category] = safeAdd(
      costByCategoryMicrousd[entry.category],
      entry.amountMicrousd,
      "Category operating cost",
    );
    costByKindMicrousd[entry.costKind] = safeAdd(
      costByKindMicrousd[entry.costKind],
      entry.amountMicrousd,
      "Cost-kind operating cost",
    );
    if (entry.measurementBasis === "actual") {
      actualCostMicrousd = safeAdd(
        actualCostMicrousd,
        entry.amountMicrousd,
        "Actual operating cost",
      );
    } else {
      estimatedCostMicrousd = safeAdd(
        estimatedCostMicrousd,
        entry.amountMicrousd,
        "Estimated operating cost",
      );
    }
  }

  return {
    activeSubscriptionKeys: getActiveSubscriptionKeys(validated),
    actualCostMicrousd,
    costByCategoryMicrousd,
    costByKindMicrousd,
    estimatedCostMicrousd,
    paymentCredentialsStored: false,
    purchaseCount: validated.filter(
      (entry) => entry.costKind === "one-time-purchase",
    ).length,
    schemaVersion: interviewOperatingCostReportSchemaVersion,
    subscriptionChargeCount: validated.filter(
      (entry) => entry.costKind === "subscription",
    ).length,
    totalOperatingCostMicrousd: safeAdd(
      actualCostMicrousd,
      estimatedCostMicrousd,
      "Total operating cost",
    ),
  };
}

export function buildInterviewFullyLoadedEconomicsReport(
  unitEconomics: InterviewUnitEconomicsReport,
  operatingCosts: InterviewOperatingCostReport,
): InterviewFullyLoadedEconomicsReport {
  const totalFullyLoadedEstimatedCostMicrousd = safeAdd(
    unitEconomics.totalEstimatedCostMicrousd,
    operatingCosts.totalOperatingCostMicrousd,
    "Fully loaded interview cost",
  );

  return {
    apiEstimatedCostMicrousd: unitEconomics.totalEstimatedCostMicrousd,
    estimatedCostMicrousdPerApprovedField: divideOrNull(
      totalFullyLoadedEstimatedCostMicrousd,
      unitEconomics.approvedFieldCount,
    ),
    estimatedCostMicrousdPerCompletion: divideOrNull(
      totalFullyLoadedEstimatedCostMicrousd,
      unitEconomics.completedInterviewCount,
    ),
    estimatedCostMicrousdPerCorrection: divideOrNull(
      totalFullyLoadedEstimatedCostMicrousd,
      unitEconomics.correctionCount,
    ),
    estimatedCostMicrousdPerHumanReviewMinuteSaved:
      unitEconomics.estimatedHumanReviewTimeSavedMs === 0
        ? null
        : roundRatio(
            totalFullyLoadedEstimatedCostMicrousd,
            unitEconomics.estimatedHumanReviewTimeSavedMs / 60_000,
          ),
    estimatedCostMicrousdPerStart: divideOrNull(
      totalFullyLoadedEstimatedCostMicrousd,
      unitEconomics.startedInterviewCount,
    ),
    operatingCostMicrousd: operatingCosts.totalOperatingCostMicrousd,
    paymentCredentialsStored: false,
    schemaVersion: interviewFullyLoadedEconomicsSchemaVersion,
    totalFullyLoadedEstimatedCostMicrousd,
  };
}

function validateCostEvidence(cost: InterviewOperatingCost): void {
  if (
    cost.measurementBasis === "actual" &&
    (cost.approvalKey === null || cost.evidenceKey === null)
  ) {
    throw new Error(
      "Actual operating costs require approval and evidence keys",
    );
  }
}

function validateCostKind(cost: InterviewOperatingCost): void {
  if (cost.costKind === "subscription") {
    if (
      cost.subscriptionKey === null ||
      !["annual", "monthly"].includes(cost.billingCadence) ||
      cost.subscriptionStatus === "not-applicable"
    ) {
      throw new Error("Subscription costs require subscription billing state");
    }
    return;
  }

  if (
    cost.subscriptionKey !== null ||
    cost.subscriptionStatus !== "not-applicable"
  ) {
    throw new Error("Non-subscription costs cannot claim subscription state");
  }
  const expectedCadence: Record<
    Exclude<InterviewOperatingCostKind, "subscription">,
    InterviewBillingCadence
  > = {
    labor: "hourly",
    "one-time-purchase": "one-time",
    usage: "usage",
  };
  if (cost.billingCadence !== expectedCadence[cost.costKind]) {
    throw new Error("Operating cost kind and billing cadence do not agree");
  }
}

function getActiveSubscriptionKeys(
  entries: readonly InterviewOperatingCost[],
): readonly string[] {
  const latest = new Map<string, InterviewOperatingCost>();
  for (const entry of entries) {
    if (entry.subscriptionKey === null) continue;
    const current = latest.get(entry.subscriptionKey);
    if (
      !current ||
      Date.parse(entry.incurredAt) > Date.parse(current.incurredAt)
    ) {
      latest.set(entry.subscriptionKey, entry);
    }
  }
  return [...latest.values()]
    .filter(
      (entry) =>
        entry.subscriptionStatus === "active" ||
        entry.subscriptionStatus === "trial",
    )
    .map((entry) => entry.subscriptionKey!)
    .sort();
}

function divideOrNull(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : roundRatio(numerator, denominator);
}

function roundRatio(numerator: number, denominator: number): number {
  return Math.round((numerator / denominator) * 1_000_000) / 1_000_000;
}

function safeAdd(left: number, right: number, label: string): number {
  const result = left + right;
  if (!Number.isSafeInteger(result)) {
    throw new Error(`${label} exceeds the safe integer range`);
  }
  return result;
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  label: string,
): T {
  if (typeof value === "string" && allowed.has(value as T)) return value as T;
  throw new Error(`${label} is invalid`);
}

function requireIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be a lowercase identifier`);
  }
  return value;
}

function requireNullableIdentifier(
  value: unknown,
  label: string,
): string | null {
  if (value === null) return null;
  return requireIdentifier(value, label);
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
