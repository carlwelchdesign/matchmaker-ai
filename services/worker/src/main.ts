import { WorkerRuntime } from "./runtime.js";

const logger = {
  info(fields: Readonly<Record<string, unknown>>, message: string): void {
    process.stdout.write(
      `${JSON.stringify({ level: "info", message, ...fields })}\n`,
    );
  },
};

const worker = new WorkerRuntime(
  logger,
  process.env.APP_VERSION ?? "0.0.0-dev",
);
worker.start();

const keepAlive = setInterval(() => undefined, 60_000);

function shutdown(signal: NodeJS.Signals): void {
  clearInterval(keepAlive);
  worker.stop(signal);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
