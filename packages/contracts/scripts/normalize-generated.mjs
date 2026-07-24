import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const generatedRoots = [
  resolve(repositoryRoot, "packages/contracts/generated/typescript"),
  resolve(repositoryRoot, "apps/mobile/packages/argent_api_client"),
];
const ignoredDirectories = new Set([".dart_tool", ".turbo", "dist"]);

async function normalizeDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          await normalizeDirectory(path);
        }
        return;
      }

      const source = await readFile(path, "utf8");
      const normalized = `${source
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .join("\n")
        .trimEnd()}\n`;

      if (normalized !== source) {
        await writeFile(path, normalized);
      }
    }),
  );
}

await Promise.all(generatedRoots.map(normalizeDirectory));
