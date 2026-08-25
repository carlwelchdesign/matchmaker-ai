import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("candidate application visual boundary", () => {
  const prototypeSource = readFileSync(
    fileURLToPath(new URL("./prototype.tsx", import.meta.url)),
    "utf8",
  );
  const layoutSource = readFileSync(
    fileURLToPath(new URL("./layout.tsx", import.meta.url)),
    "utf8",
  );

  it("extends the approved Sunrise system and Montecito identity", () => {
    expect(prototypeSource).toContain(
      'className="prototype-shell landing-shell"',
    );
    expect(prototypeSource).toContain('data-theme="sunrise"');
    expect(prototypeSource).toContain("The Montecito Matchmaker");
    expect(prototypeSource).toContain("A division of Argent");
    expect(layoutSource).toContain('import "./application-sunrise.css"');
  });

  it("does not restore the obsolete campaign prototype shell", () => {
    expect(prototypeSource).not.toContain("PrototypeView");
    expect(prototypeSource).not.toContain("Prototype views");
    expect(prototypeSource).not.toContain("prototypeCampaign");
    expect(prototypeSource).not.toContain(">ARGENT<");
  });
});
