import express from "express";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { config } from "./config.js";
import { checkDatabase, database } from "./db.js";
import { contactRequestsRouter } from "./routes/contact-requests.js";
import { adminAuthRouter } from "./routes/admin-auth.js";
import { adminContactRequestsRouter } from "./routes/admin-contact-requests.js";
import { blogPostsRouter } from "./routes/blog-posts.js";
import { adminBlogPostsRouter } from "./routes/admin-blog-posts.js";
import { projectsRouter } from "./routes/projects.js";
import { adminProjectsRouter } from "./routes/admin-projects.js";
import { adminUploadsRouter } from "./routes/admin-uploads.js";
import { logSafeError } from "./services/safe-error.js";

export function createApp() {
  const app = express();
  const PgSession = connectPgSimple(session);

  app.disable("x-powered-by");
  if (config.environment === "production") app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  app.use(session({
    name: "nodvira_admin",
    store: new PgSession({
      pool: database,
      tableName: "admin_sessions",
      createTableIfMissing: false,
      pruneSessionInterval: 15 * 60,
    }),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.environment === "production",
      maxAge: config.session.maxAgeMs,
      path: "/",
    },
  }));

  app.use("/uploads", express.static(config.uploads.directory, {
    fallthrough: true,
    index: false,
    maxAge: config.environment === "production" ? "30d" : 0,
    setHeaders(response) {
      response.set("Cross-Origin-Resource-Policy", "cross-origin");
      response.set("X-Content-Type-Options", "nosniff");
    },
  }));

  const allowedOrigin = new URL(config.publicBaseUrl).origin;
  app.use("/api", (request, response, next) => {
    const origin = request.get("origin");
    if (origin === allowedOrigin) {
      response.set("Access-Control-Allow-Origin", origin);
      response.set("Vary", "Origin");
      response.set("Access-Control-Allow-Credentials", "true");
      response.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, X-File-Name");
    }
    if (request.method === "OPTIONS") return response.sendStatus(204);
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && origin !== allowedOrigin) {
      return response.status(403).json({
        error: "origin_not_allowed",
        message: "İstek kaynağı doğrulanamadı.",
      });
    }
    return next();
  });

  app.get("/api/health", async (_request, response) => {
    try {
      const database = await checkDatabase();
      response.json({
        status: "ok",
        service: "nodvira-backend",
        database: "connected",
        databaseName: database.database_name,
        serverTime: database.server_time,
      });
    } catch (error) {
      logSafeError("PostgreSQL health check failed.", error);
      response.status(503).json({
        status: "degraded",
        service: "nodvira-backend",
        database: "unavailable",
      });
    }
  });

  app.use("/api/contact-requests", contactRequestsRouter);
  app.use("/api/blog-posts", blogPostsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/contact-requests", adminContactRequestsRouter);
  app.use("/api/admin/blog-posts", adminBlogPostsRouter);
  app.use("/api/admin/projects", adminProjectsRouter);
  app.use("/api/admin/uploads", adminUploadsRouter);

  app.use((request, response) => {
    response.status(404).json({
      error: "not_found",
      message: `${request.method} ${request.path} bulunamadı.`,
    });
  });

  app.use((error, _request, response, _next) => {
    if (error?.type === "entity.too.large") {
      return response.status(413).json({
        error: "file_too_large",
        message: `Görsel boyutu en fazla ${Math.round(config.uploads.maxBytes / 1024 / 1024)} MB olabilir.`,
      });
    }
    logSafeError("Unhandled backend error.", error);
    response.status(500).json({
      error: "internal_server_error",
      message: "Beklenmeyen bir sunucu hatası oluştu.",
    });
  });

  return app;
}
