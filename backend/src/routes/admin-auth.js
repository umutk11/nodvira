import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { database } from "../db.js";

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,31}$/),
  password: z.string().min(6).max(200),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      error: "rate_limited",
      message: "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
    });
  },
});

const genericLoginError = Object.freeze({
  error: "invalid_credentials",
  message: "Kullanıcı adı veya şifre hatalı.",
});

function regenerateSession(request) {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(request) {
  return new Promise((resolve, reject) => {
    request.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function destroySession(request) {
  return new Promise((resolve, reject) => {
    request.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", loginLimiter, async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(401).json(genericLoginError);

  const result = await database.query(
    `SELECT id, username, password_hash, display_name, role, is_active,
            failed_login_count, locked_until
     FROM admins
     WHERE username = $1`,
    [parsed.data.username]
  );
  const admin = result.rows[0];

  if (!admin || !admin.is_active) {
    await bcrypt.compare(parsed.data.password, "$2b$12$tN0qCEYzntZEfAxn7fz5wu/7NDXUp1LCGjpSrP.pfdiXcLRdJ1hoC");
    return response.status(401).json(genericLoginError);
  }

  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    return response.status(423).json({
      error: "account_temporarily_locked",
      message: "Hesap geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.",
    });
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, admin.password_hash);
  if (!passwordMatches) {
    await database.query(
      `UPDATE admins
       SET failed_login_count = failed_login_count + 1,
           locked_until = CASE
             WHEN failed_login_count + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
             ELSE NULL
           END
       WHERE id = $1`,
      [admin.id]
    );
    return response.status(401).json(genericLoginError);
  }

  await database.query(
    `UPDATE admins
     SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW()
     WHERE id = $1`,
    [admin.id]
  );

  await regenerateSession(request);
  request.session.admin = {
    id: String(admin.id),
    username: admin.username,
    displayName: admin.display_name || "NODVIRA Yönetici",
    role: admin.role,
  };
  await saveSession(request);

  return response.json({ ok: true, admin: request.session.admin });
});

adminAuthRouter.get("/session", (request, response) => {
  if (!request.session?.admin?.id) {
    return response.status(401).json({
      error: "authentication_required",
      message: "Aktif yönetici oturumu bulunamadı.",
    });
  }

  return response.json({ ok: true, admin: request.session.admin });
});

adminAuthRouter.post("/logout", async (request, response) => {
  if (request.session) await destroySession(request);
  response.clearCookie("nodvira_admin", { path: "/" });
  return response.json({ ok: true });
});
