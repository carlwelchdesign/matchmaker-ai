import { describe, expect, test } from "vitest";
import {
  buildSyntheticCandidateInspection,
  candidateInspectionTimestamp,
  candidateLabel,
} from "./candidate-inspection-data";

describe("synthetic candidate fact inspection", () => {
  test("shows only approved facts with visible lineage and uncertainty totals", () => {
    const inspection = buildSyntheticCandidateInspection();

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
    expect(
      inspection.facts.every(
        (fact) => fact.provenance.derivation === "source-exact",
      ),
    ).toBe(true);
  });

  test("combines candidate, topic, and freshness filters", () => {
    const inspection = buildSyntheticCandidateInspection({
      candidateId: "candidate-ember",
      freshness: "expires-soon",
      topic: "geography",
    });

    expect(inspection.matchingFactCount).toBe(1);
    expect(inspection.facts[0]).toMatchObject({
      candidateId: "candidate-ember",
      freshness: "expires-soon",
      topic: "geography",
    });
  });

  test("returns an explicit empty result without manufacturing evidence", () => {
    const inspection = buildSyntheticCandidateInspection({
      candidateId: "candidate-tarin",
      topic: "social-rhythm",
    });

    expect(inspection.matchingFactCount).toBe(0);
    expect(inspection.facts).toEqual([]);
    expect(candidateLabel("candidate-tarin")).toBe("Tarin Vale");
  });
});
