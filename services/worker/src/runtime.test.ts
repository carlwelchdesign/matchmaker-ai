import { describe, expect, it, vi } from "vitest";

import { WorkerRuntime } from "./runtime.js";

describe("WorkerRuntime", () => {
  it("reports a stable identity and lifecycle", () => {
    const info = vi.fn();
    const worker = new WorkerRuntime({ info }, "test-version");

    expect(worker.start()).toEqual({
      service: "argent-worker",
      state: "ok",
      version: "test-version",
    });
    worker.stop("SIGTERM");

    expect(info).toHaveBeenNthCalledWith(
      1,
      {
        health: {
          service: "argent-worker",
          state: "ok",
          version: "test-version",
        },
      },
      "Worker started",
    );
    expect(info).toHaveBeenNthCalledWith(
      2,
      { signal: "SIGTERM" },
      "Worker stopped",
    );
  });

  it("rejects duplicate starts", () => {
    const worker = new WorkerRuntime({ info: vi.fn() }, "test-version");
    worker.start();

    expect(() => worker.start()).toThrow("Worker is already started");
  });
});
