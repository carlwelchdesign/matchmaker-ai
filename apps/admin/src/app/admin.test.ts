import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("separate synthetic admin application", () => {
  test("keeps the owner concept local and disconnected", () => {
    const clientSource = readFileSync(
      fileURLToPath(new URL("./admin-home.tsx", import.meta.url)),
      "utf8",
    );
    const dataSource = readFileSync(
      fileURLToPath(new URL("./candidate-inspection-data.ts", import.meta.url)),
      "utf8",
    );
    const dashboardDataSource = readFileSync(
      fileURLToPath(new URL("./candidate-dashboard-data.ts", import.meta.url)),
      "utf8",
    );
    const dashboardViewModelSource = readFileSync(
      fileURLToPath(
        new URL("./candidate-dashboard-view-model.ts", import.meta.url),
      ),
      "utf8",
    );
    const pageSource = readFileSync(
      fileURLToPath(new URL("./page.tsx", import.meta.url)),
      "utf8",
    );
    const viewModelSource = readFileSync(
      fileURLToPath(
        new URL("./candidate-inspection-view-model.ts", import.meta.url),
      ),
      "utf8",
    );

    expect(clientSource).toContain("Owner workspace · local concept only");
    expect(clientSource).toContain("Pricing is not connected");
    expect(clientSource).toContain("Candidate discovery / synthetic map");
    expect(clientSource).toContain("Approved facts / synthetic inspection");
    expect(clientSource).toContain("Candidate analytics / synthetic dashboard");
    expect(clientSource).toContain("See the denominator");
    expect(clientSource).toContain("Missing sources remain unknown—not zero");
    expect(clientSource).toContain("metric.calculationLabel");
    expect(clientSource).toContain("metric.sourceAsOfLabel");
    expect(clientSource).toContain("Raw interviews, compatibility scores");
    expect(clientSource).toContain("will not infer or manufacture an answer");
    expect(clientSource).toContain("Current filters");
    expect(clientSource.match(/Full access-time projection/g)).toHaveLength(2);
    expect(clientSource).toContain("Knowledge-state breakdown");
    expect(clientSource).toContain("inspection.fieldStateCounts.unknown");
    expect(clientSource).toContain("inspection.fieldStateCounts.disputed");
    expect(clientSource).toContain("inspection.fieldStateCounts.private");
    expect(clientSource).toContain("Inspection access context");
    expect(clientSource).toContain("Active evidence filters");
    expect(clientSource).toContain("candidateInspectionFilterLabels");
    expect(clientSource).toContain("candidateInspectionFilterStatus");
    expect(clientSource).toContain('className="visually-hidden" role="status"');
    expect(clientSource).not.toContain('aria-live="polite"');
    expect(clientSource).toContain(
      "inspectionAccessLabels.role[inspection.sourceRole]",
    );
    expect(clientSource).toContain(
      "inspectionAccessLabels.purpose[inspection.sourcePurpose]",
    );
    expect(clientSource).toContain("Nearness does not mean a better fit");
    expect(clientSource).toContain(
      "A matchmaker decides whether to clarify information",
    );
    expect(clientSource).not.toContain("fetch(");
    expect(clientSource).not.toContain("localStorage");
    expect(clientSource).not.toContain("<form");

    expect(pageSource).not.toContain('"use client"');
    expect(pageSource).toContain("buildSyntheticCandidateInspectionPageData");
    expect(pageSource).toContain("buildSyntheticCandidateDashboardPageData");
    expect(dataSource).toContain('import "server-only"');
    expect(dashboardDataSource).toContain('import "server-only"');
    expect(dashboardDataSource).toContain(
      "authorizeCandidateDashboardMetricSet",
    );
    expect(dashboardDataSource).toContain("buildCandidateDashboardMetricSet");
    expect(dataSource).toContain("@argent/domain");
    expect(dashboardDataSource).toContain("@argent/domain");
    expect(clientSource).not.toContain("@argent/domain");
    expect(clientSource).not.toContain("candidate-dashboard-data");
    expect(clientSource).not.toContain("candidate-inspection-data");
    expect(dashboardViewModelSource).not.toContain("@argent/domain");
    expect(viewModelSource).not.toContain("@argent/domain");
  });
});
