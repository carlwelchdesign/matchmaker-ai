import { buildApiApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const host = process.env.HOST ?? "0.0.0.0";
const app = buildApiApp({
  logger: true,
  version: process.env.APP_VERSION ?? "0.0.0-dev",
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  app.log.info({ signal }, "API shutdown requested");
  await app.close();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error, "API failed to start");
  process.exitCode = 1;
}
