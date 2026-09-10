import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { database, closeDatabase } from "../src/db.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const migrationDirectory = join(scriptDirectory, "..", "migrations");

function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function ensureMigrationTable() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedMigrations() {
  const result = await database.query(
    "SELECT filename, checksum FROM schema_migrations ORDER BY filename"
  );
  return new Map(result.rows.map((row) => [row.filename, row.checksum.trim()]));
}

async function runMigration(filename, sql, sqlChecksum) {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
      [filename, sqlChecksum]
    );
    await client.query("COMMIT");
    console.log(`Applied migration: ${filename}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

try {
  await ensureMigrationTable();
  const applied = await appliedMigrations();
  const filenames = (await readdir(migrationDirectory))
    .filter((filename) => /^\d+_.+\.sql$/.test(filename))
    .sort();

  for (const filename of filenames) {
    const sql = await readFile(join(migrationDirectory, filename), "utf8");
    const sqlChecksum = checksum(sql);
    const previousChecksum = applied.get(filename);

    if (previousChecksum && previousChecksum !== sqlChecksum) {
      throw new Error(`Applied migration was changed: ${filename}`);
    }
    if (previousChecksum) {
      console.log(`Already applied: ${filename}`);
      continue;
    }
    await runMigration(filename, sql, sqlChecksum);
  }

  console.log("Database migrations are up to date.");
  process.exitCode = 0;
} catch (error) {
  console.error("Database migration failed.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
