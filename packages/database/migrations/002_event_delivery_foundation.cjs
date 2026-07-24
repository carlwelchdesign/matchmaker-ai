exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE argent_system.outbox_events (
      event_id uuid PRIMARY KEY,
      event_type text NOT NULL
        CHECK (char_length(btrim(event_type)) BETWEEN 1 AND 200),
      aggregate_type text NOT NULL
        CHECK (char_length(btrim(aggregate_type)) BETWEEN 1 AND 200),
      aggregate_id text NOT NULL
        CHECK (char_length(btrim(aggregate_id)) BETWEEN 1 AND 200),
      ordering_key text NOT NULL
        CHECK (char_length(btrim(ordering_key)) BETWEEN 1 AND 200),
      schema_version integer NOT NULL CHECK (schema_version > 0),
      payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(metadata) = 'object'),
      occurred_at timestamptz NOT NULL,
      recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      status text NOT NULL DEFAULT 'pending'
        CHECK (status IN (
          'pending',
          'leased',
          'retryable',
          'published',
          'quarantined'
        )),
      attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
      lease_owner text,
      lease_expires_at timestamptz,
      published_at timestamptz,
      last_error_code text
        CHECK (
          last_error_code IS NULL
          OR last_error_code ~ '^[a-z0-9][a-z0-9_.-]{0,99}$'
        ),
      CHECK (
        (status = 'leased' AND lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL)
        OR
        (status <> 'leased' AND lease_owner IS NULL AND lease_expires_at IS NULL)
      ),
      CHECK (
        (status = 'published' AND published_at IS NOT NULL)
        OR
        (status <> 'published' AND published_at IS NULL)
      )
    );

    COMMENT ON TABLE argent_system.outbox_events IS
      'Domain events recorded in the same transaction as their source mutation; payloads must be minimized and schema-versioned.';

    CREATE INDEX outbox_events_claim_idx
      ON argent_system.outbox_events (available_at, recorded_at, event_id)
      WHERE status IN ('pending', 'retryable');

    CREATE INDEX outbox_events_expired_lease_idx
      ON argent_system.outbox_events (lease_expires_at, event_id)
      WHERE status = 'leased';

    CREATE INDEX outbox_events_ordering_idx
      ON argent_system.outbox_events (ordering_key, recorded_at, event_id);

    CREATE TABLE argent_system.webhook_receipts (
      receipt_id uuid PRIMARY KEY,
      provider text NOT NULL
        CHECK (char_length(btrim(provider)) BETWEEN 1 AND 200),
      external_event_id text NOT NULL
        CHECK (char_length(btrim(external_event_id)) BETWEEN 1 AND 200),
      event_type text NOT NULL
        CHECK (char_length(btrim(event_type)) BETWEEN 1 AND 200),
      schema_version integer NOT NULL CHECK (schema_version > 0),
      payload_sha256 character(64) NOT NULL
        CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
      normalized_payload jsonb NOT NULL
        CHECK (jsonb_typeof(normalized_payload) = 'object'),
      signature_verified boolean NOT NULL CHECK (signature_verified),
      occurred_at timestamptz,
      received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      status text NOT NULL DEFAULT 'received'
        CHECK (status IN ('received', 'processed', 'quarantined')),
      processed_at timestamptz,
      last_error_code text
        CHECK (
          last_error_code IS NULL
          OR last_error_code ~ '^[a-z0-9][a-z0-9_.-]{0,99}$'
        ),
      UNIQUE (provider, external_event_id),
      CHECK (
        (status = 'processed' AND processed_at IS NOT NULL)
        OR
        (status <> 'processed' AND processed_at IS NULL)
      )
    );

    COMMENT ON TABLE argent_system.webhook_receipts IS
      'Verified, deduplicated provider receipts containing only normalized replay-safe payloads; raw request bodies and signatures are excluded.';

    CREATE INDEX webhook_receipts_reconcile_idx
      ON argent_system.webhook_receipts (received_at, receipt_id)
      WHERE status = 'received';

    CREATE TABLE argent_system.job_registry (
      job_id uuid PRIMARY KEY,
      job_type text NOT NULL
        CHECK (char_length(btrim(job_type)) BETWEEN 1 AND 200),
      queue_class text NOT NULL
        CHECK (queue_class IN (
          'privacy',
          'safety_verification',
          'media',
          'notifications',
          'ai',
          'reporting'
        )),
      idempotency_key text NOT NULL
        CHECK (char_length(btrim(idempotency_key)) BETWEEN 1 AND 200),
      schema_version integer NOT NULL CHECK (schema_version > 0),
      payload_sha256 character(64) NOT NULL
        CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
      payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
      status text NOT NULL DEFAULT 'registered'
        CHECK (status IN (
          'registered',
          'leased',
          'succeeded',
          'failed',
          'cancelled',
          'quarantined'
        )),
      attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
      max_attempts integer NOT NULL CHECK (max_attempts > 0),
      priority smallint NOT NULL DEFAULT 0 CHECK (priority BETWEEN -100 AND 100),
      available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      lease_owner text,
      lease_expires_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      completed_at timestamptz,
      last_error_code text
        CHECK (
          last_error_code IS NULL
          OR last_error_code ~ '^[a-z0-9][a-z0-9_.-]{0,99}$'
        ),
      UNIQUE (job_type, idempotency_key),
      CHECK (
        (status = 'leased' AND lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL)
        OR
        (status <> 'leased' AND lease_owner IS NULL AND lease_expires_at IS NULL)
      ),
      CHECK (
        (status IN ('succeeded', 'failed', 'cancelled', 'quarantined') AND completed_at IS NOT NULL)
        OR
        (status IN ('registered', 'leased') AND completed_at IS NULL)
      )
    );

    COMMENT ON TABLE argent_system.job_registry IS
      'Idempotent durable job identity and lifecycle registry; queue execution, retries, and dead-letter recovery belong to ARG-110.';

    CREATE INDEX job_registry_ready_idx
      ON argent_system.job_registry (
        queue_class,
        priority DESC,
        available_at,
        created_at
      )
      WHERE status = 'registered';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE argent_system.job_registry;
    DROP TABLE argent_system.webhook_receipts;
    DROP TABLE argent_system.outbox_events;
  `);
};
