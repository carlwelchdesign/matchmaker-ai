import { describe, expect, it } from "vitest";

import {
  buildInterviewFullyLoadedEconomicsReport,
  buildInterviewOperatingCostReport,
  interviewFullyLoadedEconomicsSchemaVersion,
  recordInterviewOperatingCost,
  type InterviewOperatingCostInput,
} from "./interview-operating-costs.js";
import {
  buildInterviewUnitEconomicsReport,
  recordInterviewOutcomeMeasurement,
} from "./interview-unit-economics.js";
import { recordInterviewUsageExecution } from "./interview-usage.js";

const baseCost: InterviewOperatingCostInput = {
  amountMicrousd: 20_000,
  approvalKey: "jenny-approved",
  billingCadence: "monthly",
  category: "storage",
  costKind: "subscription",
  entryId: "cost-storage-001",
  evidenceKey: "receipt-storage-001",
  incurredAt: "2026-08-25T18:00:00.000Z",
  measurementBasis: "actual",
  paymentSourceKey: "business-card-primary",
  serviceKey: "object-storage",
  subscriptionKey: "subscription-storage-primary",
  subscriptionStatus: "active",
  vendorKey: "synthetic-storage-vendor",
};

describe("interview operating costs", () => {
  it("tracks an approved subscription without payment credentials", () => {
    expect(recordInterviewOperatingCost(baseCost)).toMatchObject({
      paymentCredentialsStored: false,
      paymentSourceKey: "business-card-primary",
      subscriptionKey: "subscription-storage-primary",
    });
    expect(
      JSON.stringify(recordInterviewOperatingCost(baseCost)),
    ).not.toContain("cardNumber");
  });

  it("rejects raw card data and unreceipted actual charges", () => {
    expect(() =>
      recordInterviewOperatingCost({
        ...baseCost,
        cardNumber: "not-allowed",
      }),
    ).toThrow("unexpected or missing fields");
    expect(() =>
      recordInterviewOperatingCost({
        ...baseCost,
        evidenceKey: null,
      }),
    ).toThrow("require approval and evidence keys");
  });

  it("reports category, purchase, subscription, actual, and estimated costs", () => {
    const report = buildInterviewOperatingCostReport([
      recordInterviewOperatingCost(baseCost),
      recordInterviewOperatingCost({
        ...baseCost,
        amountMicrousd: 10_000,
        billingCadence: "one-time",
        category: "evaluation",
        costKind: "one-time-purchase",
        entryId: "cost-evaluation-001",
        serviceKey: "evaluation-fixtures",
        subscriptionKey: null,
        subscriptionStatus: "not-applicable",
      }),
      recordInterviewOperatingCost({
        ...baseCost,
        amountMicrousd: 30_000,
        approvalKey: null,
        billingCadence: "hourly",
        category: "support",
        costKind: "labor",
        entryId: "cost-support-001",
        evidenceKey: null,
        measurementBasis: "estimate",
        paymentSourceKey: null,
        serviceKey: "candidate-support",
        subscriptionKey: null,
        subscriptionStatus: "not-applicable",
        vendorKey: "internal-operations",
      }),
      recordInterviewOperatingCost({
        ...baseCost,
        amountMicrousd: 2_000,
        billingCadence: "usage",
        category: "payment",
        costKind: "usage",
        entryId: "cost-payment-001",
        serviceKey: "payment-processing",
        subscriptionKey: null,
        subscriptionStatus: "not-applicable",
        vendorKey: "synthetic-payment-vendor",
      }),
    ]);

    expect(report).toMatchObject({
      activeSubscriptionKeys: ["subscription-storage-primary"],
      actualCostMicrousd: 32_000,
      costByCategoryMicrousd: {
        evaluation: 10_000,
        payment: 2_000,
        storage: 20_000,
        support: 30_000,
      },
      estimatedCostMicrousd: 30_000,
      paymentCredentialsStored: false,
      purchaseCount: 1,
      subscriptionChargeCount: 1,
      totalOperatingCostMicrousd: 62_000,
    });
  });

  it("derives active subscriptions from the latest status", () => {
    const report = buildInterviewOperatingCostReport([
      recordInterviewOperatingCost(baseCost),
      recordInterviewOperatingCost({
        ...baseCost,
        amountMicrousd: 0,
        entryId: "cost-storage-canceled",
        incurredAt: "2026-09-25T18:00:00.000Z",
        subscriptionStatus: "canceled",
      }),
    ]);

    expect(report.activeSubscriptionKeys).toEqual([]);
  });

  it("adds operating overhead to fully loaded unit economics", () => {
    const outcome = recordInterviewOutcomeMeasurement({
      approvedFieldCount: 2,
      completedAt: "2026-08-25T18:20:00.000Z",
      correctionCount: 1,
      estimatedHumanReviewTimeSavedMs: 120_000,
      sessionId: "session-complete",
      startedAt: "2026-08-25T18:00:00.000Z",
    });
    const usage = recordInterviewUsageExecution({
      audioInputMs: 0,
      audioOutputMs: 0,
      cacheBehavior: "none",
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      environment: "test",
      estimatedCostMicrousd: 8_000,
      executionId: "execution-complete",
      executionKind: "ai-provider",
      inputTokens: 1_000,
      latencyMs: 500,
      mode: "typed-conversation",
      model: "synthetic-model-v1",
      occurredAt: "2026-08-25T18:10:00.000Z",
      outputTokens: 200,
      provider: "synthetic-provider",
      retryCount: 0,
      sessionId: "session-complete",
    });
    const unitEconomics = buildInterviewUnitEconomicsReport({
      outcomes: [outcome],
      usage: [usage],
    });
    const operatingCosts = buildInterviewOperatingCostReport([
      recordInterviewOperatingCost(baseCost),
    ]);

    expect(
      buildInterviewFullyLoadedEconomicsReport(unitEconomics, operatingCosts),
    ).toEqual({
      apiEstimatedCostMicrousd: 8_000,
      estimatedCostMicrousdPerApprovedField: 14_000,
      estimatedCostMicrousdPerCompletion: 28_000,
      estimatedCostMicrousdPerCorrection: 28_000,
      estimatedCostMicrousdPerHumanReviewMinuteSaved: 14_000,
      estimatedCostMicrousdPerStart: 28_000,
      operatingCostMicrousd: 20_000,
      paymentCredentialsStored: false,
      schemaVersion: interviewFullyLoadedEconomicsSchemaVersion,
      totalFullyLoadedEstimatedCostMicrousd: 28_000,
    });
  });
});
