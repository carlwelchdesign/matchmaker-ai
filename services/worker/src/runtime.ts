import { buildServiceHealth, type ServiceHealth } from "@argent/domain";

export interface WorkerLogger {
  info(fields: Readonly<Record<string, unknown>>, message: string): void;
}

export class WorkerRuntime {
  readonly #logger: WorkerLogger;
  readonly #version: string;
  #started = false;

  constructor(logger: WorkerLogger, version: string) {
    this.#logger = logger;
    this.#version = version;
  }

  start(): ServiceHealth {
    if (this.#started) {
      throw new Error("Worker is already started");
    }

    this.#started = true;
    const health = buildServiceHealth("argent-worker", this.#version);
    this.#logger.info({ health }, "Worker started");
    return health;
  }

  stop(signal: NodeJS.Signals): void {
    if (!this.#started) {
      return;
    }

    this.#started = false;
    this.#logger.info({ signal }, "Worker stopped");
  }
}
