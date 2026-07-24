import { cp, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const standaloneRoot = join(".next", "standalone", "apps", "web");
const standaloneNext = join(standaloneRoot, ".next");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

await mkdir(standaloneNext, { recursive: true });
await cp(join(".next", "static"), join(standaloneNext, "static"), {
  recursive: true,
});

if (await exists("public")) {
  await cp("public", join(standaloneRoot, "public"), { recursive: true });
}
