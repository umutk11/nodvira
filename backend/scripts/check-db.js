import { checkDatabase, closeDatabase } from "../src/db.js";

try {
  const result = await checkDatabase();
  console.log(`PostgreSQL connection successful: ${result.database_name}`);
  console.log(`PostgreSQL server time: ${result.server_time.toISOString()}`);
  process.exitCode = 0;
} catch (error) {
  console.error("PostgreSQL connection failed.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
