import { DatabaseConfigurationError } from "../config.js";
import { runMigrations } from "../migrate.js";

const direction = process.argv[2];

if (direction !== "up" && direction !== "down") {
  process.stderr.write("Usage: migrate.ts <up|down>\n");
  process.exitCode = 2;
} else if (
  direction === "down" &&
  process.env.ARGENT_ALLOW_MIGRATION_DOWN !== "true"
) {
  process.stderr.write(
    "Down migrations require ARGENT_ALLOW_MIGRATION_DOWN=true\n",
  );
  process.exitCode = 2;
} else {
  try {
    await runMigrations(
      direction === "down" ? { direction, count: 1 } : { direction },
    );
  } catch (error) {
    const message =
      error instanceof DatabaseConfigurationError
        ? error.message
        : "Database migration failed";
    process.stderr.write(`[database] ${message}\n`);
    process.exitCode = 1;
  }
}
