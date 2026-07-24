import { createHash, randomUUID } from "node:crypto";

import type { Pool, PoolClient, QueryResult } from "pg";

export type JsonValue =
  | boolean
  | number
  | string
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonObject = { readonly [key: string]: JsonValue };

export type QueueClass =
  | "privacy"
  | "safety_verification"
  | "media"
  | "notifications"
  | "ai"
  | "reporting";

export interface OutboxEventInput {
  readonly eventId?: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly orderingKey: string;
  readonly schemaVersion: number;
  readonly payload: JsonObject;
  readonly metadata?: JsonObject;
  readonly occurredAt: Date;
  readonly availableAt?: Date;
}

export interface ClaimedOutboxEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly orderingKey: string;
  readonly schemaVersion: number;
  readonly payload: JsonObject;
  readonly metadata: JsonObject;
  readonly occurredAt: Date;
  readonly attemptCount: number;
  readonly leaseExpiresAt: Date;
}

export interface ClaimOutboxOptions {
  readonly workerId: string;
  readonly limit?: number;
  readonly leaseDurationMs?: number;
}

export interface WebhookReceiptInput {
  readonly receiptId?: string;
  readonly provider: string;
  readonly externalEventId: string;
  readonly eventType: string;
  readonly schemaVersion: number;
  readonly normalizedPayload: JsonObject;
  readonly signatureVerified: boolean;
  readonly occurredAt?: Date;
}

export interface RegistrationResult {
  readonly id: string;
  readonly inserted: boolean;
}

export interface JobRegistrationInput {
  readonly jobId?: string;
  readonly jobType: string;
  readonly queueClass: QueueClass;
  readonly idempotencyKey: string;
  readonly schemaVersion: number;
  readonly payload: JsonObject;
  readonly maxAttempts: number;
  readonly priority?: number;
  readonly availableAt?: Date;
}

export class DeliveryValidationError extends Error {
  override readonly name = "DeliveryValidationError";
}

export class IdempotencyCollisionError extends Error {
  override readonly name = "IdempotencyCollisionError";
}

interface OutboxRow {
  event_id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  ordering_key: string;
  schema_version: number;
  payload: JsonObject;
  metadata: JsonObject;
  occurred_at: Date;
  attempt_count: number;
  lease_expires_at: Date;
}

function assertText(value: string, field: string): string {
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > 200) {
    throw new DeliveryValidationError(
      `${field} must contain between 1 and 200 characters`,
    );
  }
  return normalized;
}

function assertPositiveInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new DeliveryValidationError(`${field} must be a positive integer`);
  }
  return value;
}

function assertErrorCode(value: string): string {
  const normalized = value.trim();
  if (!/^[a-z0-9][a-z0-9_.-]{0,99}$/u.test(normalized)) {
    throw new DeliveryValidationError(
      "errorCode must be a non-sensitive machine-readable code",
    );
  }
  return normalized;
}

function canonicalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new DeliveryValidationError("JSON numbers must be finite");
  }
  return value;
}

export function canonicalJson(value: JsonObject): string {
  return JSON.stringify(canonicalize(value));
}

export function jsonSha256(value: JsonObject): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export async function recordOutboxEvent(
  client: PoolClient,
  input: OutboxEventInput,
): Promise<string> {
  const eventId = input.eventId ?? randomUUID();
  await client.query(
    `
      INSERT INTO argent_system.outbox_events (
        event_id,
        event_type,
        aggregate_type,
        aggregate_id,
        ordering_key,
        schema_version,
        payload,
        metadata,
        occurred_at,
        available_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        $8::jsonb,
        $9,
        COALESCE($10, clock_timestamp())
      )
    `,
    [
      eventId,
      assertText(input.eventType, "eventType"),
      assertText(input.aggregateType, "aggregateType"),
      assertText(input.aggregateId, "aggregateId"),
      assertText(input.orderingKey, "orderingKey"),
      assertPositiveInteger(input.schemaVersion, "schemaVersion"),
      canonicalJson(input.payload),
      canonicalJson(input.metadata ?? {}),
      input.occurredAt,
      input.availableAt ?? null,
    ],
  );
  return eventId;
}

export async function claimOutboxEvents(
  pool: Pool,
  { workerId, limit = 25, leaseDurationMs = 30_000 }: ClaimOutboxOptions,
): Promise<readonly ClaimedOutboxEvent[]> {
  const normalizedWorkerId = assertText(workerId, "workerId");
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new DeliveryValidationError("limit must be between 1 and 100");
  }
  if (
    !Number.isSafeInteger(leaseDurationMs) ||
    leaseDurationMs < 1_000 ||
    leaseDurationMs > 900_000
  ) {
    throw new DeliveryValidationError(
      "leaseDurationMs must be between 1000 and 900000",
    );
  }

  const result = await pool.query<OutboxRow>(
    `
      WITH candidates AS (
        SELECT event_id
        FROM argent_system.outbox_events
        WHERE
          available_at <= clock_timestamp()
          AND (
            status IN ('pending', 'retryable')
            OR (status = 'leased' AND lease_expires_at <= clock_timestamp())
          )
        ORDER BY available_at, recorded_at, event_id
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      )
      UPDATE argent_system.outbox_events AS event
      SET
        status = 'leased',
        attempt_count = event.attempt_count + 1,
        lease_owner = $2,
        lease_expires_at =
          clock_timestamp() + ($3::integer * interval '1 millisecond'),
        last_error_code = NULL
      FROM candidates
      WHERE event.event_id = candidates.event_id
      RETURNING
        event.event_id,
        event.event_type,
        event.aggregate_type,
        event.aggregate_id,
        event.ordering_key,
        event.schema_version,
        event.payload,
        event.metadata,
        event.occurred_at,
        event.attempt_count,
        event.lease_expires_at
    `,
    [limit, normalizedWorkerId, leaseDurationMs],
  );

  return result.rows.map((row) => ({
    eventId: row.event_id,
    eventType: row.event_type,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    orderingKey: row.ordering_key,
    schemaVersion: row.schema_version,
    payload: row.payload,
    metadata: row.metadata,
    occurredAt: row.occurred_at,
    attemptCount: row.attempt_count,
    leaseExpiresAt: row.lease_expires_at,
  }));
}

export async function markOutboxPublished(
  pool: Pool,
  eventId: string,
  workerId: string,
): Promise<boolean> {
  const result = await pool.query(
    `
      UPDATE argent_system.outbox_events
      SET
        status = 'published',
        published_at = clock_timestamp(),
        lease_owner = NULL,
        lease_expires_at = NULL,
        last_error_code = NULL
      WHERE
        event_id = $1
        AND status = 'leased'
        AND lease_owner = $2
        AND lease_expires_at > clock_timestamp()
    `,
    [eventId, assertText(workerId, "workerId")],
  );
  return result.rowCount === 1;
}

export async function releaseOutboxEvent(
  pool: Pool,
  options: {
    readonly eventId: string;
    readonly workerId: string;
    readonly errorCode: string;
    readonly retryAt?: Date;
    readonly quarantine?: boolean;
  },
): Promise<boolean> {
  const result = await pool.query(
    `
      UPDATE argent_system.outbox_events
      SET
        status = $3,
        available_at = COALESCE($4, clock_timestamp()),
        lease_owner = NULL,
        lease_expires_at = NULL,
        last_error_code = $5
      WHERE
        event_id = $1
        AND status = 'leased'
        AND lease_owner = $2
    `,
    [
      options.eventId,
      assertText(options.workerId, "workerId"),
      options.quarantine === true ? "quarantined" : "retryable",
      options.retryAt ?? null,
      assertErrorCode(options.errorCode),
    ],
  );
  return result.rowCount === 1;
}

async function resolveIdempotentInsert(
  result: QueryResult<{ id: string }>,
  lookup: () => Promise<
    QueryResult<{
      id: string;
      payload_sha256: string;
      event_type?: string;
      job_type?: string;
      queue_class?: QueueClass;
      schema_version: number;
      max_attempts?: number;
      priority?: number;
    }>
  >,
  expected: {
    readonly hash: string;
    readonly type: string;
    readonly schemaVersion: number;
    readonly queueClass?: QueueClass;
    readonly maxAttempts?: number;
    readonly priority?: number;
  },
): Promise<RegistrationResult> {
  const inserted = result.rows[0];
  if (inserted !== undefined) {
    return { id: inserted.id, inserted: true };
  }

  const existing = (await lookup()).rows[0];
  const storedType = existing?.event_type ?? existing?.job_type;
  if (
    existing === undefined ||
    existing.payload_sha256 !== expected.hash ||
    storedType !== expected.type ||
    existing.schema_version !== expected.schemaVersion ||
    (expected.queueClass !== undefined &&
      existing.queue_class !== expected.queueClass) ||
    (expected.maxAttempts !== undefined &&
      existing.max_attempts !== expected.maxAttempts) ||
    (expected.priority !== undefined && existing.priority !== expected.priority)
  ) {
    throw new IdempotencyCollisionError(
      "The idempotency key is already associated with different content",
    );
  }
  return { id: existing.id, inserted: false };
}

export async function recordWebhookReceipt(
  pool: Pool,
  input: WebhookReceiptInput,
): Promise<RegistrationResult> {
  if (!input.signatureVerified) {
    throw new DeliveryValidationError(
      "Webhook signature verification is required before persistence",
    );
  }
  const provider = assertText(input.provider, "provider");
  const externalEventId = assertText(input.externalEventId, "externalEventId");
  const eventType = assertText(input.eventType, "eventType");
  const schemaVersion = assertPositiveInteger(
    input.schemaVersion,
    "schemaVersion",
  );
  const payload = canonicalJson(input.normalizedPayload);
  const hash = jsonSha256(input.normalizedPayload);
  const receiptId = input.receiptId ?? randomUUID();

  const inserted = await pool.query<{ id: string }>(
    `
      INSERT INTO argent_system.webhook_receipts (
        receipt_id,
        provider,
        external_event_id,
        event_type,
        schema_version,
        payload_sha256,
        normalized_payload,
        signature_verified,
        occurred_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, true, $8)
      ON CONFLICT (provider, external_event_id) DO NOTHING
      RETURNING receipt_id AS id
    `,
    [
      receiptId,
      provider,
      externalEventId,
      eventType,
      schemaVersion,
      hash,
      payload,
      input.occurredAt ?? null,
    ],
  );

  return resolveIdempotentInsert(
    inserted,
    () =>
      pool.query(
        `
          SELECT
            receipt_id AS id,
            payload_sha256,
            event_type,
            schema_version
          FROM argent_system.webhook_receipts
          WHERE provider = $1 AND external_event_id = $2
        `,
        [provider, externalEventId],
      ),
    { hash, type: eventType, schemaVersion },
  );
}

export async function markWebhookProcessed(
  pool: Pool,
  receiptId: string,
): Promise<boolean> {
  const result = await pool.query(
    `
      UPDATE argent_system.webhook_receipts
      SET status = 'processed', processed_at = clock_timestamp()
      WHERE receipt_id = $1 AND status = 'received'
    `,
    [receiptId],
  );
  return result.rowCount === 1;
}

export async function registerJob(
  pool: Pool,
  input: JobRegistrationInput,
): Promise<RegistrationResult> {
  const jobType = assertText(input.jobType, "jobType");
  const idempotencyKey = assertText(input.idempotencyKey, "idempotencyKey");
  const schemaVersion = assertPositiveInteger(
    input.schemaVersion,
    "schemaVersion",
  );
  const maxAttempts = assertPositiveInteger(input.maxAttempts, "maxAttempts");
  const priority = input.priority ?? 0;
  if (!Number.isSafeInteger(priority) || priority < -100 || priority > 100) {
    throw new DeliveryValidationError("priority must be between -100 and 100");
  }
  const payload = canonicalJson(input.payload);
  const hash = jsonSha256(input.payload);
  const jobId = input.jobId ?? randomUUID();

  const inserted = await pool.query<{ id: string }>(
    `
      INSERT INTO argent_system.job_registry (
        job_id,
        job_type,
        queue_class,
        idempotency_key,
        schema_version,
        payload_sha256,
        payload,
        max_attempts,
        priority,
        available_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
      ON CONFLICT (job_type, idempotency_key) DO NOTHING
      RETURNING job_id AS id
    `,
    [
      jobId,
      jobType,
      input.queueClass,
      idempotencyKey,
      schemaVersion,
      hash,
      payload,
      maxAttempts,
      priority,
      input.availableAt ?? new Date(),
    ],
  );

  return resolveIdempotentInsert(
    inserted,
    () =>
      pool.query(
        `
          SELECT
            job_id AS id,
            payload_sha256,
            job_type,
            queue_class,
            schema_version,
            max_attempts,
            priority
          FROM argent_system.job_registry
          WHERE job_type = $1 AND idempotency_key = $2
        `,
        [jobType, idempotencyKey],
      ),
    {
      hash,
      type: jobType,
      schemaVersion,
      queueClass: input.queueClass,
      maxAttempts,
      priority,
    },
  );
}
