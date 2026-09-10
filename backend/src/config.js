import "dotenv/config";
import path from "node:path";

function integerFromEnvironment(name, fallback, { min = 1, max = 65535 } = {}) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;
  const value = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return value;
}

function booleanFromEnvironment(name, fallback = false) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;
  throw new Error(`${name} must be true or false.`);
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

export const config = Object.freeze({
  environment: process.env.NODE_ENV || "development",
  host: process.env.HOST || "127.0.0.1",
  port: integerFromEnvironment("PORT", 3000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://127.0.0.1:4173",
  database: Object.freeze({
    connectionString: requiredEnvironment("DATABASE_URL"),
    ssl: booleanFromEnvironment("DB_SSL", false),
    poolMax: integerFromEnvironment("DB_POOL_MAX", 10, { min: 1, max: 50 }),
  }),
  session: Object.freeze({
    secret: requiredEnvironment("SESSION_SECRET"),
    maxAgeMs: integerFromEnvironment("SESSION_MAX_AGE_HOURS", 8, { min: 1, max: 168 }) * 60 * 60 * 1000,
  }),
  adminBootstrap: Object.freeze({
    username: process.env.ADMIN_BOOTSTRAP_USERNAME?.trim().toLowerCase() || "",
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD || "",
    displayName: process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "NODVIRA Yönetici",
  }),
  mail: Object.freeze({
    mode: process.env.MAIL_MODE || "log",
    host: process.env.SMTP_HOST || "",
    port: integerFromEnvironment("SMTP_PORT", 587),
    secure: booleanFromEnvironment("SMTP_SECURE", false),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "info@nodvira.com",
    notificationTo: process.env.CONTACT_NOTIFICATION_TO || "info@nodvira.com",
  }),
  uploads: Object.freeze({
    directory: path.resolve(process.env.UPLOAD_DIR || "uploads"),
    maxBytes: integerFromEnvironment("MAX_UPLOAD_MB", 5, { min: 1, max: 25 }) * 1024 * 1024,
    unusedGraceHours: integerFromEnvironment("UNUSED_UPLOAD_GRACE_HOURS", 24, { min: 1, max: 720 }),
  }),
});

if (!["log", "smtp"].includes(config.mail.mode)) {
  throw new Error("MAIL_MODE must be log or smtp.");
}

if (config.mail.mode === "smtp") {
  for (const [name, value] of [
    ["SMTP_HOST", config.mail.host],
    ["SMTP_USER", config.mail.user],
    ["SMTP_PASSWORD", config.mail.password],
  ]) {
    if (!value) throw new Error(`${name} is required when MAIL_MODE=smtp.`);
  }
}

if (config.environment === "production") {
  if (/^demo(?:[_-]|$)/.test(config.adminBootstrap.username)) {
    throw new Error("Demo admin account cannot be used in production.");
  }
  if (config.adminBootstrap.password && config.adminBootstrap.password.length < 16) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 16 characters in production.");
  }
}
