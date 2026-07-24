import { Client } from "pg";
import { PG_MIGRATE_LOCK_ID } from "node-pg-migrate";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { requireDatabaseUrl } from "./config.js";
import { foundationFixturePack } from "./fixtures.js";
import { runMigrations } from "./migrate.js";
import { seedSyntheticFixtures } from "./seed.js";

const databaseUrl = requireDatabaseUrl(process.env.TEST_DATABASE_URL);
const client = new Client({ connectionString: databaseUrl });

describe.sequential("database foundation", () => {
  beforeAll(async () => {
    await client.connect();
    await runMigrations({ databaseUrl, direction: "up" });
  });

  afterAll(async () => {
    await client.end();
  });

  it("creates explicit purpose-separated schemas", async () => {
    const result = await client.query<{ schema_name: string }>(
      `
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = ANY($1::text[])
        ORDER BY schema_name
      `,
      [["argent_app", "argent_audit", "argent_private", "argent_system"]],
    );

    expect(result.rows.map(({ schema_name }) => schema_name)).toEqual([
      "argent_app",
      "argent_audit",
      "argent_private",
      "argent_system",
    ]);

    const history = await client.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM argent_migrations.history",
    );
    expect(history.rows[0]?.count).toBe("2");
  });

  it("fails closed while another migration session owns the advisory lock", async () => {
    await client.query("SELECT pg_advisory_lock($1)", [PG_MIGRATE_LOCK_ID]);

    try {
      await expect(
        runMigrations({ databaseUrl, direction: "up" }),
      ).rejects.toThrow("Another migration is already running");
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [PG_MIGRATE_LOCK_ID]);
    }
  });

  it("installs the synthetic fixture pack idempotently", async () => {
    await seedSyntheticFixtures({
      databaseUrl,
      environment: "test",
      pack: foundationFixturePack,
    });
    await seedSyntheticFixtures({
      databaseUrl,
      environment: "test",
      pack: foundationFixturePack,
    });

    const references = await client.query<{
      key: string;
      namespace: string;
    }>(
      `
        SELECT namespace, key
        FROM argent_system.reference_values
        ORDER BY namespace, key
      `,
    );
    const installations = await client.query<{ count: string }>(
      `
        SELECT count(*)::text AS count
        FROM argent_system.fixture_installations
        WHERE fixture_key = $1 AND fixture_version = $2
      `,
      [foundationFixturePack.fixtureKey, foundationFixturePack.fixtureVersion],
    );

    expect(references.rows).toEqual([
      { namespace: "data_classification", key: "confidential" },
      { namespace: "data_classification", key: "internal" },
      { namespace: "data_classification", key: "public" },
      { namespace: "data_classification", key: "restricted" },
    ]);
    expect(installations.rows[0]?.count).toBe("1");
  });

  it("rejects mutated contents under an installed fixture version", async () => {
    await expect(
      seedSyntheticFixtures({
        databaseUrl,
        environment: "test",
        pack: {
          ...foundationFixturePack,
          description: "Mutated without a version increment.",
        },
      }),
    ).rejects.toThrow("conflicts with its installed checksum");

    const references = await client.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM argent_system.reference_values",
    );
    expect(references.rows[0]?.count).toBe("4");
  });

  it("reverses the foundation migration and reapplies it", async () => {
    await runMigrations({ databaseUrl, direction: "down", count: 2 });

    const result = await client.query<{ count: string }>(
      `
        SELECT count(*)::text AS count
        FROM information_schema.schemata
        WHERE schema_name = ANY($1::text[])
      `,
      [["argent_app", "argent_audit", "argent_private", "argent_system"]],
    );

    expect(result.rows[0]?.count).toBe("0");

    await runMigrations({ databaseUrl, direction: "up" });
  });
});
