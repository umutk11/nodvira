import { createApp } from "./app.js";
import { config } from "./config.js";
import { checkDatabase, closeDatabase } from "./db.js";

const app = createApp();

const server = app.listen(config.port, config.host, async () => {
  console.log(`NODVIRA backend listening on http://${config.host}:${config.port}`);
  try {
    const database = await checkDatabase();
    console.log(`PostgreSQL connected: ${database.database_name}`);
  } catch {
    console.warn("PostgreSQL is not available yet; /api/health will report degraded status.");
  }
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing NODVIRA backend.`);
  server.close(async () => {
    try {
      await closeDatabase();
    } finally {
      process.exit(0);
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

