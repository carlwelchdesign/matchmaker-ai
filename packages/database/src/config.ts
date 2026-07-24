export type SeedEnvironment = "local" | "test" | "staging" | "production";

export class DatabaseConfigurationError extends Error {
  override readonly name = "DatabaseConfigurationError";
}

export function requireDatabaseUrl(value = process.env.DATABASE_URL): string {
  if (value === undefined || value.trim().length === 0) {
    throw new DatabaseConfigurationError("DATABASE_URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new DatabaseConfigurationError(
      "DATABASE_URL must be a valid PostgreSQL URL",
    );
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL must use postgres:// or postgresql://",
    );
  }

  if (
    parsed.hostname.length === 0 ||
    parsed.username.length === 0 ||
    parsed.pathname.length <= 1
  ) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL must include a host, user, and database name",
    );
  }

  return value;
}

export function parseSeedEnvironment(
  value = process.env.ARGENT_ENVIRONMENT,
): SeedEnvironment {
  if (
    value === "local" ||
    value === "test" ||
    value === "staging" ||
    value === "production"
  ) {
    return value;
  }

  throw new DatabaseConfigurationError(
    "ARGENT_ENVIRONMENT must be local, test, staging, or production",
  );
}

export function assertSyntheticSeedAllowed(
  environment: SeedEnvironment,
  explicitApproval = process.env.ALLOW_SYNTHETIC_SEED,
): void {
  if (environment === "production") {
    throw new DatabaseConfigurationError(
      "Synthetic fixtures are never allowed in production",
    );
  }

  if (environment === "staging" && explicitApproval !== "true") {
    throw new DatabaseConfigurationError(
      "Staging synthetic fixtures require ALLOW_SYNTHETIC_SEED=true",
    );
  }
}
