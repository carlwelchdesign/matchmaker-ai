import { fileURLToPath } from "node:url";

import { runner } from "node-pg-migrate";

import { requireDatabaseUrl } from "./config.js";

export type MigrationDirection = "up" | "down";

const migrationsDirectory = fileURLToPath(
  new URL("../migrations", import.meta.url),
);

export interface MigrationOptions {
  readonly databaseUrl?: string;
  readonly direction: MigrationDirection;
  readonly count?: number;
}

export async function runMigrations({
  databaseUrl = requireDatabaseUrl(),
  direction,
  count,
}: MigrationOptions): Promise<void> {
  await runner({
    databaseUrl,
    direction,
    ...(count === undefined ? {} : { count }),
    dir: migrationsDirectory,
    migrationsSchema: "argent_migrations",
    migrationsTable: "history",
    createMigrationsSchema: true,
    advisoryLockMode: "fail",
    checkOrder: true,
    singleTransaction: true,
    verbose: false,
    logger: {
      debug: () => undefined,
      info: (message) => process.stdout.write(`[database] ${message}\n`),
      warn: (message) =>
        process.stderr.write(`[database] warning: ${message}\n`),
      error: (message) =>
        process.stderr.write(`[database] migration error: ${message}\n`),
    },
  });
}
