import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const packageRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(packageRoot, "../..");

const tokenSource = readFileSync(
  resolve(packageRoot, "tokens/nocturne.tokens.json"),
  "utf8",
);
const webOutput = readFileSync(
  resolve(packageRoot, "generated/web/nocturne.css"),
  "utf8",
);
const dartOutput = readFileSync(
  resolve(packageRoot, "generated/dart/argent_tokens.dart"),
  "utf8",
);
const mobileDartOutput = readFileSync(
  resolve(repoRoot, "apps/mobile/lib/theme/argent_tokens.dart"),
  "utf8",
);

describe("Nocturne token generation", () => {
  test("keeps canonical tokens human-readable", () => {
    const parsed = JSON.parse(tokenSource);

    expect(parsed.name).toBe("Argent Nocturne");
    expect(parsed.semantic.surface.canvas.$value).toBe(
      "{primitive.color.aubergine.950}",
    );
    expect(parsed.component.button.radius.$value).toBe("{primitive.radius.md}");
  });

  test("emits semantic web CSS variables", () => {
    expect(webOutput).toContain("--argent-semantic-surface-canvas: #130f14;");
    expect(webOutput).toContain("--argent-semantic-action-primary: #8f3e46;");
    expect(webOutput).toContain("--argent-component-button-radius: 8px;");
  });

  test("emits typed Flutter tokens and keeps the mobile copy synchronized", () => {
    expect(dartOutput).toContain(
      "static const semanticSurfaceCanvas = Color(0xFF130F14);",
    );
    expect(dartOutput).toContain(
      "static const double componentButtonRadius = 8;",
    );
    expect(mobileDartOutput).toBe(dartOutput);
  });
});
