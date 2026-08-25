import { describe, expect, it } from "vitest";

import {
  createInterviewBudgetAttribution,
  createInterviewBudgetRule,
  evaluateScopedInterviewBudgets,
  type InterviewBudgetDimension,
} from "./interview-budget-scopes.js";
import {
  recordInterviewUsageExecution,
  validateInterviewUsageExecution,
} from "./interview-usage.js";

const execution = recordInterviewUsageExecution({
  audioInputMs: 0,
  audioOutputMs: 0,
  cacheBehavior: "none",
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  environment: "test",
  estimatedCostMicrousd: 2_500,
  executionId: "execution-101",
  executionKind: "ai-provider",
  inputTokens: 1_500,
  latencyMs: 900,
  mode: "typed-conversation",
  model: "synthetic-model-v1",
  occurredAt: "2026-08-25T18:45:00.000Z",
  outputTokens: 300,
  provider: "synthetic-provider",
  retryCount: 0,
  sessionId: "session-101",
});

const attribution = createInterviewBudgetAttribution({
  candidateBudgetKey: "candidate-budget-101",
  cohortBudgetKey: "cohort-budget-101",
  execution,
});

const dimensionValues: ReadonlyArray<
  readonly [InterviewBudgetDimension, string]
> = [
  ["environment", "test"],
  ["mode", "typed-conversation"],
  ["cohort", "cohort-budget-101"],
  ["candidate", "candidate-budget-101"],
  ["day", "2026-08-25"],
  ["provider", "synthetic-provider"],
];

function makeRule(dimension: InterviewBudgetDimension, value: string) {
  return createInterviewBudgetRule({
    alertAtBasisPoints: 5_000,
    dimension,
    maxEstimatedCostMicrousd: 5_000,
    maxExecutions: 2,
    ruleId: `${dimension}-budget-101`,
    value,
  });
}

describe("scoped interview budgets", () => {
  it.each(dimensionValues)(
    "emits a warning for the %s budget without blocking the interview",
    (dimension, value) => {
      expect(
        evaluateScopedInterviewBudgets({
          history: [],
          proposed: attribution,
          rules: [makeRule(dimension, value)],
        }),
      ).toEqual({
        action: "allow",
        alerts: [
          {
            dimension,
            estimatedCostMicrousd: 2_500,
            executionCount: 1,
            ruleId: `${dimension}-budget-101`,
            status: "warning",
            value,
          },
        ],
      });
    },
  );

  it("falls back when any matching scoped budget is exceeded", () => {
    const rule = createInterviewBudgetRule({
      alertAtBasisPoints: 8_000,
      dimension: "candidate",
      maxEstimatedCostMicrousd: 2_499,
      maxExecutions: 2,
      ruleId: "candidate-budget-hard-limit",
      value: "candidate-budget-101",
    });

    expect(
      evaluateScopedInterviewBudgets({
        history: [],
        proposed: attribution,
        rules: [rule],
      }),
    ).toMatchObject({
      action: "structured-fallback",
      alerts: [{ ruleId: rule.ruleId, status: "exceeded" }],
    });
  });

  it("aggregates matching history within the selected scope", () => {
    const prior = createInterviewBudgetAttribution({
      ...attribution,
      execution: validateInterviewUsageExecution({
        ...execution,
        executionId: "execution-100",
        occurredAt: "2026-08-25T18:30:00.000Z",
      }),
    });
    const rule = createInterviewBudgetRule({
      alertAtBasisPoints: 5_000,
      dimension: "day",
      maxEstimatedCostMicrousd: 10_000,
      maxExecutions: 1,
      ruleId: "day-budget-aggregate",
      value: "2026-08-25",
    });

    expect(
      evaluateScopedInterviewBudgets({
        history: [prior],
        proposed: attribution,
        rules: [rule],
      }),
    ).toMatchObject({
      action: "structured-fallback",
      alerts: [
        {
          estimatedCostMicrousd: 5_000,
          executionCount: 2,
          status: "exceeded",
        },
      ],
    });
  });

  it("ignores nonmatching scopes", () => {
    expect(
      evaluateScopedInterviewBudgets({
        history: [],
        proposed: attribution,
        rules: [makeRule("cohort", "cohort-budget-999")],
      }),
    ).toEqual({ action: "allow", alerts: [] });
  });

  it("rejects content fields and non-opaque candidate keys", () => {
    expect(() =>
      createInterviewBudgetAttribution({
        ...attribution,
        sourceText: "private candidate response",
      }),
    ).toThrow("unexpected fields");
    expect(() =>
      createInterviewBudgetAttribution({
        ...attribution,
        candidateBudgetKey: "Jenny Griffin",
      }),
    ).toThrow("opaque lowercase identifier");
    expect(() =>
      createInterviewBudgetAttribution({
        ...attribution,
        execution: { ...execution, sourceText: "private candidate response" },
      }),
    ).toThrow("unexpected or missing fields");
    expect(() =>
      createInterviewBudgetRule({
        alertAtBasisPoints: 5_000,
        dimension: "day",
        maxEstimatedCostMicrousd: 5_000,
        maxExecutions: 2,
        ruleId: "invalid-day-budget",
        value: "2026-02-31",
      }),
    ).toThrow("valid ISO date");
  });

  it("rejects duplicate rule and execution IDs", () => {
    const rule = makeRule("environment", "test");
    expect(() =>
      evaluateScopedInterviewBudgets({
        history: [attribution],
        proposed: attribution,
        rules: [rule],
      }),
    ).toThrow("duplicate executions");
    expect(() =>
      evaluateScopedInterviewBudgets({
        history: [],
        proposed: attribution,
        rules: [rule, rule],
      }),
    ).toThrow("duplicate rules");
  });
});
