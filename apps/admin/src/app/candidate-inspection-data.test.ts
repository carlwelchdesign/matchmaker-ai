import { describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildSyntheticCandidateInspection,
  buildSyntheticCandidateInspectionPageData,
  candidateInspectionTimestamp,
} from "./candidate-inspection-data";
import {
  candidateLabel,
  filterCandidateInspection,
} from "./candidate-inspection-view-model";

describe("synthetic candidate fact inspection", () => {
  test("shows only approved facts with visible lineage and uncertainty totals", () => {
    const inspection = buildSyntheticCandidateInspection();
    const pageData = buildSyntheticCandidateInspectionPageData();

    expect(inspection.approvedFactsOnly).toBe(true);
    expect(inspection.rawInterviewContentIncluded).toBe(false);
    expect(inspection.inspectedAt).toBe(candidateInspectionTimestamp);
    expect(inspection.matchingFactCount).toBe(5);
    expect(inspection.excludedFactCount).toBe(2);
    expect(inspection.fieldStateCounts).toMatchObject({
      disputed: 1,
      private: 1,
      unknown: 3,
    });
    expect(pageData.inspection).toMatchObject({
      sourcePurpose: "matchmaker-discovery",
      sourceRole: "matchmaker",
    });
    expect(
      inspection.facts.every(
        (fact) => fact.provenance.derivation === "source-exact",
      ),
    ).toBe(true);
  });

  test("combines candidate, topic, and freshness filters", () => {
    const data = buildSyntheticCandidateInspectionPageData();
    const inspection = filterCandidateInspection(data.inspection, {
      candidateId: "candidate-ember",
      freshness: "expires-soon",
      topic: "geography",
    });

    expect(inspection.matchingFactCount).toBe(1);
    expect(inspection.approvedFactCount).toBe(5);
    expect(inspection.excludedFactCount).toBe(2);
    expect(inspection.fieldStateCounts).toEqual({
      disputed: 1,
      private: 1,
      unknown: 3,
    });
    expect(inspection.facts[0]).toMatchObject({
      candidateId: "candidate-ember",
      freshness: "expires-soon",
      topic: "geography",
    });
  });

  test("returns an explicit empty result without manufacturing evidence", () => {
    const data = buildSyntheticCandidateInspectionPageData();
    const inspection = filterCandidateInspection(data.inspection, {
      candidateId: "candidate-tarin",
      topic: "social-rhythm",
    });

    expect(inspection.matchingFactCount).toBe(0);
    expect(inspection.facts).toEqual([]);
    expect(candidateLabel(data.candidates, "candidate-tarin")).toBe(
      "Tarin Vale",
    );
  });
});
