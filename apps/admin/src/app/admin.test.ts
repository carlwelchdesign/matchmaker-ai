import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("separate synthetic admin application", () => {
  test("keeps the owner concept local and disconnected", () => {
    const clientSource = readFileSync(
      fileURLToPath(new URL("./admin-home.tsx", import.meta.url)),
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
    expect(clientSource).toContain("Raw interviews, compatibility scores");
    expect(clientSource).toContain("will not infer or manufacture an answer");
    expect(clientSource).toContain("Nearness does not mean a better fit");
    expect(clientSource).toContain(
      "A matchmaker decides whether to clarify information",
    );
    expect(clientSource).not.toContain("fetch(");
    expect(clientSource).not.toContain("localStorage");
    expect(clientSource).not.toContain("<form");

    expect(pageSource).not.toContain('"use client"');
    expect(pageSource).toContain("buildSyntheticCandidateInspectionPageData");
    expect(clientSource).not.toContain("@argent/domain");
    expect(clientSource).not.toContain("candidate-inspection-data");
    expect(viewModelSource).not.toContain("@argent/domain");
  });
});
