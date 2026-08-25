import { describe, expect, it } from "vitest";

import {
  buildInterviewUnitEconomicsReport,
  interviewOutcomeSchemaVersion,
  interviewUnitEconomicsSchemaVersion,
  recordInterviewOutcomeMeasurement,
} from "./interview-unit-economics.js";
import { recordInterviewUsageExecution } from "./interview-usage.js";

const completedOutcome = recordInterviewOutcomeMeasurement({
  approvedFieldCount: 3,
  completedAt: "2026-08-25T18:20:00.000Z",
  correctionCount: 2,
  estimatedHumanReviewTimeSavedMs: 240_000,
  sessionId: "session-complete",
  startedAt: "2026-08-25T18:00:00.000Z",
});
const startedOutcome = recordInterviewOutcomeMeasurement({
  approvedFieldCount: 0,
  completedAt: null,
  correctionCount: 0,
  estimatedHumanReviewTimeSavedMs: 0,
  sessionId: "session-started",
  startedAt: "2026-08-25T18:30:00.000Z",
});

function createUsage(
  sessionId: string,
  executionId: string,
  estimatedCostMicrousd: number,
  occurredAt: string,
) {
  return recordInterviewUsageExecution({
    audioInputMs: 0,
    audioOutputMs: 0,
    cacheBehavior: "none",
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    environment: "test",
    estimatedCostMicrousd,
    executionId,
    executionKind: "ai-provider",
    inputTokens: 1_000,
    latencyMs: 500,
    mode: "typed-conversation",
    model: "synthetic-model-v1",
    occurredAt,
    outputTokens: 200,
    provider: "synthetic-provider",
    retryCount: 0,
    sessionId,
  });
}

describe("interview unit economics", () => {
  it("records a content-free session outcome", () => {
    expect(completedOutcome).toMatchObject({
      approvedFieldCount: 3,
      schemaVersion: interviewOutcomeSchemaVersion,
      sourceContentStored: false,
    });
    expect(JSON.stringify(completedOutcome)).not.toContain("answer");
  });

  it("reports cost per start, completion, approved field, correction, and saved minute", () => {
    const report = buildInterviewUnitEconomicsReport({
      outcomes: [completedOutcome, startedOutcome],
      usage: [
        createUsage(
          "session-complete",
          "execution-complete",
          5_000,
          "2026-08-25T18:10:00.000Z",
        ),
        createUsage(
          "session-started",
          "execution-started",
          1_000,
          "2026-08-25T18:31:00.000Z",
        ),
      ],
    });

    expect(report).toEqual({
      approvedFieldCount: 3,
      completedInterviewCount: 1,
      correctionCount: 2,
      estimatedCostMicrousdPerApprovedField: 2_000,
      estimatedCostMicrousdPerCompletion: 6_000,
      estimatedCostMicrousdPerCorrection: 3_000,
      estimatedCostMicrousdPerHumanReviewMinuteSaved: 1_500,
      estimatedCostMicrousdPerStart: 3_000,
      estimatedHumanReviewTimeSavedMs: 240_000,
      schemaVersion: interviewUnitEconomicsSchemaVersion,
      sourceContentStored: false,
      startedInterviewCount: 2,
      totalEstimatedCostMicrousd: 6_000,
    });
  });

  it("uses null when an outcome denominator is zero", () => {
    expect(
      buildInterviewUnitEconomicsReport({
        outcomes: [startedOutcome],
        usage: [],
      }),
    ).toMatchObject({
      estimatedCostMicrousdPerApprovedField: null,
      estimatedCostMicrousdPerCompletion: null,
      estimatedCostMicrousdPerCorrection: null,
      estimatedCostMicrousdPerHumanReviewMinuteSaved: null,
      estimatedCostMicrousdPerStart: 0,
    });
  });

  it("rejects source content and impossible incomplete outcomes", () => {
    expect(() =>
      recordInterviewOutcomeMeasurement({
        approvedFieldCount: 0,
        completedAt: null,
        correctionCount: 0,
        estimatedHumanReviewTimeSavedMs: 0,
        sessionId: "session-rejected",
        sourceText: "private candidate response",
        startedAt: "2026-08-25T18:00:00.000Z",
      }),
    ).toThrow("unexpected or missing fields");
    expect(() =>
      recordInterviewOutcomeMeasurement({
        approvedFieldCount: 1,
        completedAt: null,
        correctionCount: 0,
        estimatedHumanReviewTimeSavedMs: 60_000,
        sessionId: "session-rejected",
        startedAt: "2026-08-25T18:00:00.000Z",
      }),
    ).toThrow("Incomplete interviews cannot claim");
  });

  it("rejects unlinked, duplicate, and out-of-window usage", () => {
    const baseUsage = createUsage(
      "session-complete",
      "execution-complete",
      1_000,
      "2026-08-25T18:10:00.000Z",
    );
    expect(() =>
      buildInterviewUnitEconomicsReport({
        outcomes: [completedOutcome],
        usage: [{ ...baseUsage, sessionId: "session-unknown" }],
      }),
    ).toThrow("has no outcome session");
    expect(() =>
      buildInterviewUnitEconomicsReport({
        outcomes: [completedOutcome],
        usage: [baseUsage, baseUsage],
      }),
    ).toThrow("duplicate executions");
    expect(() =>
      buildInterviewUnitEconomicsReport({
        outcomes: [completedOutcome],
        usage: [
          {
            ...baseUsage,
            occurredAt: "2026-08-25T18:21:00.000Z",
          },
        ],
      }),
    ).toThrow("cannot follow session completion");
  });
});
