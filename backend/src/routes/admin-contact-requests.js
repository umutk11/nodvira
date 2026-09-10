import { Router } from "express";
import { z } from "zod";
import { database } from "../db.js";
import { requireAdmin } from "../middleware/admin-auth.js";

const idSchema = z.coerce.number().int().positive();
const updateSchema = z.object({
  status: z.enum(["new", "read", "closed"]),
  adminNote: z.string().trim().max(5000).optional(),
});

const serviceLabels = Object.freeze({
  web: "Web Çözümleri",
  software: "Yazılım Çözümleri",
  network: "Network Çözümleri",
  system: "Sistem Çözümleri",
  consulting: "Teknoloji Danışmanlığı",
  privacy: "KVKK Başvurusu",
  other: "Diğer",
});

function serialize(row) {
  return {
    id: String(row.id),
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    service: row.service,
    serviceLabel: serviceLabels[row.service] || row.service,
    message: row.message,
    status: row.status,
    adminNote: row.admin_note,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readAt: row.read_at,
    closedAt: row.closed_at,
  };
}

export const adminContactRequestsRouter = Router();
adminContactRequestsRouter.use(requireAdmin);

adminContactRequestsRouter.get("/", async (request, response) => {
  const status = ["new", "read", "closed"].includes(request.query.status)
    ? request.query.status
    : null;
  const search = String(request.query.search || "").trim().slice(0, 160);
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 50, 1), 100);
  const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const result = await database.query(
    `SELECT id, name, company, email, phone, service, message, status, admin_note,
            source_url, created_at, updated_at, read_at, closed_at
     FROM contact_requests
     WHERE ($1::text IS NULL OR status = $1)
       AND ($2::text = '' OR name ILIKE '%' || $2 || '%'
            OR email ILIKE '%' || $2 || '%'
            OR COALESCE(company, '') ILIKE '%' || $2 || '%')
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [status, search, limit, offset]
  );

  const totals = await database.query(
    `SELECT COUNT(*)::integer AS total,
            COUNT(*) FILTER (WHERE status = 'new')::integer AS new,
            COUNT(*) FILTER (WHERE status = 'read')::integer AS read,
            COUNT(*) FILTER (WHERE status = 'closed')::integer AS closed
     FROM contact_requests`
  );

  return response.json({
    ok: true,
    items: result.rows.map(serialize),
    counts: totals.rows[0],
    page,
    limit,
  });
});

adminContactRequestsRouter.get("/:id", async (request, response) => {
  const parsedId = idSchema.safeParse(request.params.id);
  if (!parsedId.success) {
    return response.status(404).json({ error: "not_found", message: "Talep bulunamadı." });
  }

  const result = await database.query(
    `SELECT id, name, company, email, phone, service, message, status, admin_note,
            source_url, created_at, updated_at, read_at, closed_at
     FROM contact_requests WHERE id = $1`,
    [parsedId.data]
  );
  if (!result.rows[0]) {
    return response.status(404).json({ error: "not_found", message: "Talep bulunamadı." });
  }

  return response.json({ ok: true, item: serialize(result.rows[0]) });
});

adminContactRequestsRouter.patch("/:id", async (request, response) => {
  const parsedId = idSchema.safeParse(request.params.id);
  const parsedBody = updateSchema.safeParse(request.body);
  if (!parsedId.success || !parsedBody.success) {
    return response.status(422).json({
      error: "validation_failed",
      message: "Talep durumu güncellenemedi.",
    });
  }

  const result = await database.query(
    `UPDATE contact_requests
     SET status = $2::varchar,
         admin_note = COALESCE($3::text, admin_note),
         read_at = CASE
           WHEN $2::text IN ('read', 'closed') THEN COALESCE(read_at, NOW())
           ELSE NULL
         END,
         closed_at = CASE WHEN $2::text = 'closed' THEN COALESCE(closed_at, NOW()) ELSE NULL END
     WHERE id = $1
     RETURNING id, name, company, email, phone, service, message, status, admin_note,
               source_url, created_at, updated_at, read_at, closed_at`,
    [parsedId.data, parsedBody.data.status, parsedBody.data.adminNote || null]
  );
  if (!result.rows[0]) {
    return response.status(404).json({ error: "not_found", message: "Talep bulunamadı." });
  }

  return response.json({ ok: true, item: serialize(result.rows[0]) });
});
