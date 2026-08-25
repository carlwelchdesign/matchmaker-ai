import { describe, expect, it } from "vitest";

import {
  evaluateInterviewBudget,
  interviewUsageSchemaVersion,
  recordInterviewUsageExecution,
  type InterviewBudgetPolicy,
  type InterviewUsageExecutionInput,
} from "./interview-usage.js";

const providerExecution: InterviewUsageExecutionInput = {
  audioInputMs: 0,
  audioOutputMs: 0,
  cacheBehavior: "read",
  cacheReadTokens: 500,
  cacheWriteTokens: 0,
  environment: "test",
  estimatedCostMicrousd: 2_500,
  executionId: "execution-001",
  executionKind: "ai-provider",
  inputTokens: 1_500,
  latencyMs: 900,
  mode: "typed-conversation",
  model: "synthetic-model-v1",
  occurredAt: "2026-08-25T17:30:00.000Z",
  outputTokens: 300,
  provider: "synthetic-provider",
  retryCount: 0,
  sessionId: "session-001",
};

const policy: InterviewBudgetPolicy = {
  featureEnabled: true,
  maxAudioMsPerExecution: 60_000,
  maxAudioMsPerSession: 120_000,
  maxEstimatedCostMicrousdPerSession: 10_000,
  maxExecutionsPerSession: 4,
  maxInputTokensPerExecution: 2_000,
  maxInputTokensPerSession: 4_000,
  maxLatencyMsPerExecution: 5_000,
  maxOutputTokensPerExecution: 500,
  maxOutputTokensPerSession: 1_000,
  maxSessionElapsedMs: 900_000,
  maxTurnsPerSession: 4,
  providerEnabled: true,
};

describe("interview usage ledger", () => {
  it("records content-free provider usage with cost and cache lineage", () => {
    expect(recordInterviewUsageExecution(providerExecution)).toEqual({
      ...providerExecution,
      schemaVersion: interviewUsageSchemaVersion,
      sourceContentStored: false,
    });
  });

  it("records the current deterministic planner as zero provider usage", () => {
    expect(
      recordInterviewUsageExecution({
        ...providerExecution,
        cacheBehavior: "none",
        cacheReadTokens: 0,
        estimatedCostMicrousd: 0,
        executionKind: "deterministic-template",
        inputTokens: 0,
        model: null,
        outputTokens: 0,
        provider: null,
      }),
    ).toMatchObject({
      estimatedCostMicrousd: 0,
      executionKind: "deterministic-template",
      model: null,
      provider: null,
      sourceContentStored: false,
    });
  });

  it("rejects source content, invalid cache claims, and fake deterministic cost", () => {
    expect(() =>
      recordInterviewUsageExecution({
        ...providerExecution,
        sourceText: "private candidate response",
      }),
    ).toThrow("unexpected or missing fields");
    expect(() =>
      recordInterviewUsageExecution({
        ...providerExecution,
        cacheBehavior: "none",
      }),
    ).toThrow("cache metrics do not agree");
    expect(() =>
      recordInterviewUsageExecution({
        ...providerExecution,
        executionKind: "deterministic-template",
        model: null,
        provider: null,
      }),
    ).toThrow("deterministic execution cannot claim provider usage");
  });

  it("allows usage within the session budget", () => {
    const execution = recordInterviewUsageExecution(providerExecution);
    expect(
      evaluateInterviewBudget({
        execution,
        existingExecutions: [],
        policy,
        sessionElapsedMs: 60_000,
        sessionTurnCount: 0,
      }),
    ).toEqual({ action: "allow", estimatedSessionCostMicrousd: 2_500 });
  });

  it.each([
    ["feature-kill-switch", { featureEnabled: false }],
    ["provider-kill-switch", { providerEnabled: false }],
    ["input-token-limit", { maxInputTokensPerExecution: 1_499 }],
    ["output-token-limit", { maxOutputTokensPerExecution: 299 }],
    ["latency-limit", { maxLatencyMsPerExecution: 899 }],
    ["audio-limit", { maxAudioMsPerExecution: 0 }],
    ["turn-limit", { maxTurnsPerSession: 0 }],
    ["session-time-limit", { maxSessionElapsedMs: 59_999 }],
    ["cost-limit", { maxEstimatedCostMicrousdPerSession: 2_499 }],
  ] as const)("falls back deterministically for %s", (reason, override) => {
    const execution = recordInterviewUsageExecution({
      ...providerExecution,
      audioInputMs: reason === "audio-limit" ? 1 : 0,
    });
    expect(
      evaluateInterviewBudget({
        execution,
        existingExecutions: [],
        policy: { ...policy, ...override },
        sessionElapsedMs: 60_000,
        sessionTurnCount: 0,
      }),
    ).toMatchObject({ action: "structured-fallback", reason });
  });

  it("falls back at the execution limit without mutating prior usage", () => {
    const execution = recordInterviewUsageExecution(providerExecution);
    const existingExecutions = Array.from({ length: 4 }, (_, index) => ({
      ...execution,
      executionId: `execution-00${index + 2}`,
    }));

    expect(
      evaluateInterviewBudget({
        execution,
        existingExecutions,
        policy,
        sessionElapsedMs: 60_000,
        sessionTurnCount: 0,
      }),
    ).toMatchObject({
      action: "structured-fallback",
      reason: "execution-limit",
    });
    expect(existingExecutions).toHaveLength(4);
  });

  it.each([
    ["feature-kill-switch", { featureEnabled: false }],
    ["provider-kill-switch", { providerEnabled: false }],
  ] as const)(
    "exercises %s without mutating usage history",
    (reason, override) => {
      const existing = recordInterviewUsageExecution({
        ...providerExecution,
        executionId: "execution-existing",
      });
      const history = [existing];
      const before = JSON.stringify(history);

      expect(
        evaluateInterviewBudget({
          execution: recordInterviewUsageExecution(providerExecution),
          existingExecutions: history,
          policy: { ...policy, ...override },
          sessionElapsedMs: 60_000,
          sessionTurnCount: 1,
        }),
      ).toMatchObject({ action: "structured-fallback", reason });
      expect(JSON.stringify(history)).toBe(before);
    },
  );

  it("rejects duplicate executions instead of double-counting cost", () => {
    const execution = recordInterviewUsageExecution(providerExecution);

    expect(() =>
      evaluateInterviewBudget({
        execution,
        existingExecutions: [execution],
        policy,
        sessionElapsedMs: 60_000,
        sessionTurnCount: 0,
      }),
    ).toThrow("duplicate execution");
  });

  it.each([
    ["session-input-token-limit", { maxInputTokensPerSession: 2_999 }],
    ["session-output-token-limit", { maxOutputTokensPerSession: 599 }],
    ["session-audio-limit", { maxAudioMsPerSession: 1_999 }],
  ] as const)(
    "falls back when cumulative usage reaches %s",
    (reason, override) => {
      const existing = recordInterviewUsageExecution({
        ...providerExecution,
        audioInputMs: 1_000,
        executionId: "execution-existing",
      });
      const execution = recordInterviewUsageExecution({
        ...providerExecution,
        audioInputMs: 1_000,
      });

      expect(
        evaluateInterviewBudget({
          execution,
          existingExecutions: [existing],
          policy: { ...policy, ...override },
          sessionElapsedMs: 60_000,
          sessionTurnCount: 1,
        }),
      ).toMatchObject({ action: "structured-fallback", reason });
    },
  );
});
