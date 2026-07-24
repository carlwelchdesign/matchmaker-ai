import { Client } from "pg";

import {
  assertSyntheticSeedAllowed,
  parseSeedEnvironment,
  requireDatabaseUrl,
  type SeedEnvironment,
} from "./config.js";
import {
  fixturePackChecksum,
  foundationFixturePack,
  type SyntheticFixturePack,
} from "./fixtures.js";

export interface SeedOptions {
  readonly databaseUrl?: string;
  readonly environment?: SeedEnvironment;
  readonly explicitApproval?: string;
  readonly pack?: SyntheticFixturePack;
}

export async function seedSyntheticFixtures({
  databaseUrl = requireDatabaseUrl(),
  environment = parseSeedEnvironment(),
  explicitApproval,
  pack = foundationFixturePack,
}: SeedOptions = {}): Promise<void> {
  assertSyntheticSeedAllowed(environment, explicitApproval);

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      ["argent:synthetic-fixtures"],
    );

    for (const referenceValue of pack.referenceValues) {
      await client.query(
        `
          INSERT INTO argent_system.reference_values (
            namespace,
            key,
            label,
            is_active
          )
          VALUES ($1, $2, $3, true)
          ON CONFLICT (namespace, key)
          DO UPDATE SET
            label = EXCLUDED.label,
            is_active = EXCLUDED.is_active,
            updated_at = current_timestamp
        `,
        [referenceValue.namespace, referenceValue.key, referenceValue.label],
      );
    }

    const installation = await client.query(
      `
        INSERT INTO argent_system.fixture_installations (
          fixture_key,
          fixture_version,
          checksum_sha256,
          target_environment
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (fixture_key, fixture_version)
        DO UPDATE SET
          applied_at = current_timestamp
        WHERE
          argent_system.fixture_installations.checksum_sha256 =
            EXCLUDED.checksum_sha256
          AND argent_system.fixture_installations.target_environment =
            EXCLUDED.target_environment
        RETURNING fixture_key
      `,
      [
        pack.fixtureKey,
        pack.fixtureVersion,
        fixturePackChecksum(pack),
        environment,
      ],
    );

    if (installation.rowCount !== 1) {
      throw new Error(
        `Fixture pack ${pack.fixtureKey}@${pack.fixtureVersion} conflicts with its installed checksum or environment`,
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }

  process.stdout.write(
    `[database] applied synthetic fixture pack ${pack.fixtureKey}@${pack.fixtureVersion} (${pack.referenceValues.length} reference values)\n`,
  );
}
