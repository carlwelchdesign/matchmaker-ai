import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { requireDatabaseUrl } from "./config.js";
import {
  claimOutboxEvents,
  DeliveryValidationError,
  IdempotencyCollisionError,
  markOutboxPublished,
  markWebhookProcessed,
  recordOutboxEvent,
  recordWebhookReceipt,
  registerJob,
  releaseOutboxEvent,
} from "./delivery.js";
import { runMigrations } from "./migrate.js";

const databaseUrl = requireDatabaseUrl(process.env.TEST_DATABASE_URL);
const pool = new Pool({ connectionString: databaseUrl, max: 6 });

describe.sequential("event delivery foundation", () => {
  beforeAll(async () => {
    await runMigrations({ databaseUrl, direction: "up" });
  });

  beforeEach(async () => {
    await pool.query(`
      TRUNCATE
        argent_system.outbox_events,
        argent_system.webhook_receipts,
        argent_system.job_registry
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("records an outbox event atomically with its source transaction", async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const eventId = await recordOutboxEvent(client, {
        eventType: "test.source.changed",
        aggregateType: "test_source",
        aggregateId: "source-1",
        orderingKey: "test_source:source-1",
        schemaVersion: 1,
        payload: { sourceId: "source-1" },
        occurredAt: new Date(),
      });
      await client.query("ROLLBACK");

      const result = await pool.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM argent_system.outbox_events WHERE event_id = $1",
        [eventId],
      );
      expect(result.rows[0]?.count).toBe("0");
    } finally {
      client.release();
    }
  });

  it("leases disjoint outbox batches and enforces lease ownership", async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const aggregateId of ["one", "two"]) {
        await recordOutboxEvent(client, {
          eventType: "test.source.changed",
          aggregateType: "test_source",
          aggregateId,
          orderingKey: `test_source:${aggregateId}`,
          schemaVersion: 1,
          payload: { aggregateId },
          occurredAt: new Date(),
        });
      }
      await client.query("COMMIT");
    } finally {
      client.release();
    }

    const [left, right] = await Promise.all([
      claimOutboxEvents(pool, { workerId: "worker-left", limit: 1 }),
      claimOutboxEvents(pool, { workerId: "worker-right", limit: 1 }),
    ]);

    expect(left).toHaveLength(1);
    expect(right).toHaveLength(1);
    expect(left[0]?.eventId).not.toBe(right[0]?.eventId);
    expect(
      await markOutboxPublished(pool, left[0]?.eventId ?? "", "wrong-worker"),
    ).toBe(false);
    expect(
      await markOutboxPublished(pool, left[0]?.eventId ?? "", "worker-left"),
    ).toBe(true);
    expect(
      await releaseOutboxEvent(pool, {
        eventId: right[0]?.eventId ?? "",
        workerId: "worker-right",
        errorCode: "provider.unavailable",
      }),
    ).toBe(true);

    const retry = await claimOutboxEvents(pool, {
      workerId: "worker-retry",
      limit: 2,
    });
    expect(retry.map(({ eventId }) => eventId)).toEqual([right[0]?.eventId]);
    expect(retry[0]?.attemptCount).toBe(2);
  });

  it("recovers an event after its prior worker lease expires", async () => {
    const client = await pool.connect();
    let eventId = "";
    try {
      await client.query("BEGIN");
      eventId = await recordOutboxEvent(client, {
        eventType: "test.source.changed",
        aggregateType: "test_source",
        aggregateId: "expired",
        orderingKey: "test_source:expired",
        schemaVersion: 1,
        payload: { aggregateId: "expired" },
        occurredAt: new Date(),
      });
      await client.query("COMMIT");
    } finally {
      client.release();
    }

    const original = await claimOutboxEvents(pool, {
      workerId: "worker-stopped",
      limit: 1,
    });
    expect(original[0]?.eventId).toBe(eventId);

    await pool.query(
      `
        UPDATE argent_system.outbox_events
        SET lease_expires_at = clock_timestamp() - interval '1 second'
        WHERE event_id = $1
      `,
      [eventId],
    );

    expect(
      await releaseOutboxEvent(pool, {
        eventId,
        workerId: "worker-stopped",
        errorCode: "worker.recovered_late",
      }),
    ).toBe(false);

    const recovered = await claimOutboxEvents(pool, {
      workerId: "worker-recovery",
      limit: 1,
    });
    expect(recovered[0]?.eventId).toBe(eventId);
    expect(recovered[0]?.attemptCount).toBe(2);
  });

  it("rejects array payloads and free-form persisted errors", async () => {
    await expect(
      pool.query(
        `
          INSERT INTO argent_system.outbox_events (
            event_id,
            event_type,
            aggregate_type,
            aggregate_id,
            ordering_key,
            schema_version,
            payload,
            occurred_at
          )
          VALUES ($1, 'test.invalid', 'test_source', 'invalid', 'invalid', 1, '[]'::jsonb, clock_timestamp())
        `,
        [randomUUID()],
      ),
    ).rejects.toThrow();

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await recordOutboxEvent(client, {
        eventType: "test.source.changed",
        aggregateType: "test_source",
        aggregateId: "safe-error",
        orderingKey: "test_source:safe-error",
        schemaVersion: 1,
        payload: { aggregateId: "safe-error" },
        occurredAt: new Date(),
      });
      await client.query("COMMIT");
    } finally {
      client.release();
    }
    const [claimed] = await claimOutboxEvents(pool, {
      workerId: "worker-errors",
      limit: 1,
    });
    await expect(
      releaseOutboxEvent(pool, {
        eventId: claimed?.eventId ?? "",
        workerId: "worker-errors",
        errorCode: "free form provider response",
      }),
    ).rejects.toThrow(DeliveryValidationError);
  });

  it("records only verified webhooks and deduplicates identical receipts", async () => {
    const input = {
      provider: "synthetic-provider",
      externalEventId: "event-1",
      eventType: "synthetic.completed",
      schemaVersion: 1,
      normalizedPayload: { result: "complete", reference: "safe-reference" },
      signatureVerified: true,
    } as const;

    await expect(
      recordWebhookReceipt(pool, {
        ...input,
        externalEventId: "unverified",
        signatureVerified: false,
      }),
    ).rejects.toThrow(DeliveryValidationError);

    const first = await recordWebhookReceipt(pool, input);
    const duplicate = await recordWebhookReceipt(pool, {
      ...input,
      normalizedPayload: {
        reference: "safe-reference",
        result: "complete",
      },
    });

    expect(first.inserted).toBe(true);
    expect(duplicate).toEqual({ id: first.id, inserted: false });
    expect(await markWebhookProcessed(pool, first.id)).toBe(true);
    expect(await markWebhookProcessed(pool, first.id)).toBe(false);
  });

  it("rejects webhook event ID reuse with different content", async () => {
    const input = {
      provider: "synthetic-provider",
      externalEventId: "event-collision",
      eventType: "synthetic.completed",
      schemaVersion: 1,
      normalizedPayload: { result: "complete" },
      signatureVerified: true,
    } as const;
    await recordWebhookReceipt(pool, input);

    await expect(
      recordWebhookReceipt(pool, {
        ...input,
        normalizedPayload: { result: "changed" },
      }),
    ).rejects.toThrow(IdempotencyCollisionError);
  });

  it("registers jobs idempotently and detects idempotency collisions", async () => {
    const input = {
      jobType: "synthetic.reconcile",
      queueClass: "reporting",
      idempotencyKey: "reconcile-1",
      schemaVersion: 1,
      payload: { reference: "safe-reference" },
      maxAttempts: 3,
    } as const;

    const first = await registerJob(pool, input);
    const duplicate = await registerJob(pool, input);
    expect(duplicate).toEqual({ id: first.id, inserted: false });

    await expect(
      registerJob(pool, {
        ...input,
        payload: { reference: "different-reference" },
      }),
    ).rejects.toThrow(IdempotencyCollisionError);

    await expect(
      registerJob(pool, {
        ...input,
        queueClass: "ai",
      }),
    ).rejects.toThrow(IdempotencyCollisionError);
  });
});
