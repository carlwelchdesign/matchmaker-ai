exports.up = (pgm) => {
  for (const schema of [
    "argent_app",
    "argent_private",
    "argent_audit",
    "argent_system",
  ]) {
    pgm.createSchema(schema);
  }

  pgm.createTable(
    { schema: "argent_system", name: "reference_values" },
    {
      namespace: { type: "text", notNull: true },
      key: { type: "text", notNull: true },
      label: { type: "text", notNull: true },
      is_active: { type: "boolean", notNull: true, default: true },
      created_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
      updated_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    },
    {
      constraints: {
        primaryKey: ["namespace", "key"],
      },
      comment:
        "Non-personal, version-controlled reference values installed by approved seed packs.",
    },
  );

  pgm.createTable(
    { schema: "argent_system", name: "fixture_installations" },
    {
      fixture_key: { type: "text", notNull: true },
      fixture_version: { type: "integer", notNull: true },
      checksum_sha256: { type: "character(64)", notNull: true },
      target_environment: { type: "text", notNull: true },
      applied_at: {
        type: "timestamp with time zone",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    },
    {
      constraints: {
        primaryKey: ["fixture_key", "fixture_version"],
        check: [
          "fixture_version > 0",
          "checksum_sha256 ~ '^[0-9a-f]{64}$'",
          "target_environment IN ('local', 'test', 'staging')",
        ],
      },
      comment:
        "Provenance ledger for deterministic synthetic fixture packs; production is forbidden.",
    },
  );
};

exports.down = (pgm) => {
  pgm.dropTable({ schema: "argent_system", name: "fixture_installations" });
  pgm.dropTable({ schema: "argent_system", name: "reference_values" });

  for (const schema of [
    "argent_system",
    "argent_audit",
    "argent_private",
    "argent_app",
  ]) {
    pgm.dropSchema(schema);
  }
};
