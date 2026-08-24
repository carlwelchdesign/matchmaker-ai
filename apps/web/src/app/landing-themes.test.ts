import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

describe("public Sunrise landing page", () => {
  test("uses the selected Sunrise art direction and hero", () => {
    const themeSource = readFileSync(
      fileURLToPath(new URL("./landing-sunrise.css", import.meta.url)),
      "utf8",
    );
    const heroPath = fileURLToPath(
      new URL("../../public/images/argent-sunrise-hero.png", import.meta.url),
    );

    expect(themeSource).toContain('data-theme="sunrise"');
    expect(themeSource).toContain("--landing-canvas:");
    expect(themeSource).toContain("--landing-accent:");
    expect(existsSync(heroPath)).toBe(true);
  });

  test("keeps the pre-launch boundary visible in public copy", () => {
    const splashSource = readFileSync(
      fileURLToPath(new URL("./public-splash.tsx", import.meta.url)),
      "utf8",
    );

    expect(splashSource).toContain("Opening soon");
    expect(splashSource).toContain("privacy terms");
    expect(splashSource).toContain("Guided by a matchmaker");
    expect(splashSource).toContain("both people");
    expect(splashSource).not.toContain("guaranteed");
  });
});
