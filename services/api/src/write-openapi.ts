import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildApiApp } from "./app.js";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const outputPath = resolve(
  repositoryRoot,
  "packages/contracts/openapi/argent-v1.json",
);
const app = await buildApiApp();

try {
  await app.ready();
  const contract = `${JSON.stringify(app.swagger(), null, 2)}\n`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, contract, "utf8");
} finally {
  await app.close();
}
