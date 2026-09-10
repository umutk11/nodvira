import bcrypt from "bcryptjs";
import { config } from "../src/config.js";
import { database, closeDatabase } from "../src/db.js";

try {
  const username = config.adminBootstrap.username;
  const password = config.adminBootstrap.password;

  if (!username || !password) {
    throw new Error("ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD are required.");
  }
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(username)) {
    throw new Error("Admin username must be 3-32 lowercase letters, numbers, underscores or hyphens.");
  }
  if (password.length < 16) throw new Error("Admin password must be at least 16 characters.");

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await database.query(
    `INSERT INTO admins (username, password_hash, display_name, is_active)
     VALUES ($1, $2, $3, TRUE)
     ON CONFLICT (username) DO NOTHING
     RETURNING id, username, display_name`,
    [username, passwordHash, config.adminBootstrap.displayName]
  );

  if (!result.rows[0]) {
    throw new Error("Admin account already exists; bootstrap will not overwrite or reactivate it.");
  }
  console.log(`Admin account is ready: ${result.rows[0].username}`);
} catch (error) {
  console.error("Admin account could not be prepared.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
