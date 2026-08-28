import { describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildSyntheticCandidateDashboardPageData } from "./candidate-dashboard-data";

describe("synthetic candidate analytics dashboard", () => {
  test("presents exact calculations and honest unavailable-source states", () => {
    const data = buildSyntheticCandidateDashboardPageData();

    expect(data.metrics).toHaveLength(15);
    expect(
      data.metrics.find((metric) => metric.key === "candidate-supply"),
    ).toMatchObject({
      calculationLabel: "6 counted",
      displayValue: "6",
      freshnessLabel: "Fresh",
      missingDataLabel: "Available",
    });
    expect(
      data.metrics.find((metric) => metric.key === "interview-approved-fields"),
    ).toMatchObject({
      calculationLabel: "12 counted",
      displayValue: "12",
      missingDataLabel: "Available",
    });
    expect(
      data.metrics.find(
        (metric) => metric.key === "interview-correction-burden",
      ),
    ).toMatchObject({
      calculationLabel: "2 of 4 completed interviews",
      displayValue: "50%",
      missingDataLabel: "Available",
    });
    expect(
      data.metrics.find((metric) => metric.key === "interview-completion-rate"),
    ).toMatchObject({
      calculationLabel: "4 of 6 interview starts",
      displayValue: "66.7%",
      missingDataLabel: "Available",
    });
    expect(
      data.metrics.find((metric) => metric.key === "search-retrieval-coverage"),
    ).toMatchObject({
      calculationLabel: "6 of 10 eligible opportunities",
      displayValue: "60%",
      freshnessLabel: "Fresh",
      missingDataLabel: "Available",
      sourceAsOfLabel: "Aug 28, 2026, 7:30 PM UTC",
    });
    expect(
      data.metrics.find((metric) => metric.key === "search-review-rate"),
    ).toMatchObject({
      calculationLabel: "4 of 6 retrieved opportunities",
      displayValue: "66.7%",
    });
    expect(data.searchCriteriaContext).toEqual({
      criteriaVersionsLabel: "criteria-synthetic-v1",
      policyVersionsLabel: "search-policy-synthetic-v1",
    });
    expect(data.interviewModeBreakdown.map((mode) => mode.label)).toEqual([
      "Structured",
      "Typed conversation",
      "Voice",
      "Hybrid",
      "Mixed mode",
      "Unobserved mode",
    ]);
    expect(data.interviewModeMinimumCohortSize).toBe(5);
    expect(data.interviewModeSourceContext).toEqual({
      freshnessLabel: "Fresh",
      sourceAsOfLabel: "Aug 28, 2026, 8:00 PM UTC",
      sourceLabel: "Content-free interview outcomes",
    });
    expect(
      data.interviewModeBreakdown.find((mode) => mode.mode === "structured")
        ?.metrics,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          calculationLabel: "4 of 5 interview starts",
          displayValue: "80%",
          key: "interview-completion-rate",
        }),
        expect.objectContaining({
          calculationLabel: "2 of 4 completed interviews",
          displayValue: "50%",
          key: "interview-correction-burden",
        }),
      ]),
    );
    expect(
      data.interviewModeBreakdown.find((mode) => mode.mode === "mixed"),
    ).toMatchObject({
      attributionNote: "The interview switched modes during one session.",
      metrics: expect.arrayContaining([
        expect.objectContaining({
          calculationLabel: "0 of 0 completed interviews",
          displayValue: "—",
          key: "interview-correction-burden",
          missingDataLabel: "Missing denominator",
        }),
      ]),
    });
    expect(
      data.interviewModeBreakdown.find((mode) => mode.mode === "unobserved")
        ?.metrics,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayValue: "—",
          key: "interview-starts",
          missingDataLabel: "Suppressed small cohort",
        }),
      ]),
    );
  });

  test("keeps the client view model aggregate and content-free", () => {
    const serialized = JSON.stringify(
      buildSyntheticCandidateDashboardPageData(),
    );

    expect(serialized).not.toMatch(/candidate-(?:ember|noor|tarin)/);
    expect(serialized).not.toMatch(
      /transcript|prompt|audio|compatibility score/i,
    );
    expect(serialized).not.toMatch(/query content|candidate search id/i);
    expect(serialized).toContain("Product analytics only");
    expect(serialized).toContain("candidate identifiers are not stored");
  });
});
