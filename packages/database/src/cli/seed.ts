import { DatabaseConfigurationError } from "../config.js";
import { seedSyntheticFixtures } from "../seed.js";

try {
  await seedSyntheticFixtures();
} catch (error) {
  const message =
    error instanceof DatabaseConfigurationError
      ? error.message
      : "Synthetic fixture installation failed";
  process.stderr.write(`[database] ${message}\n`);
  process.exitCode = 1;
}
