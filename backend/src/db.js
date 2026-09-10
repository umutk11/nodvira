import pg from "pg";
import { config } from "./config.js";
import { logSafeError } from "./services/safe-error.js";

const { Pool } = pg;

export const database = new Pool({
  connectionString: config.database.connectionString,
  max: config.database.poolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: config.database.ssl ? { rejectUnauthorized: true } : false,
});

database.on("error", (error) => {
  logSafeError("Unexpected PostgreSQL pool error.", error);
});

export async function checkDatabase() {
  const result = await database.query(
    "SELECT current_database() AS database_name, NOW() AS server_time"
  );
  return result.rows[0];
}

export async function closeDatabase() {
  await database.end();
}
