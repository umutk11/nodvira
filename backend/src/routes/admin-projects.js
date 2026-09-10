import { Router } from "express";
import { z } from "zod";
import { database } from "../db.js";
import { requireAdmin } from "../middleware/admin-auth.js";
import { isManagedUploadPath } from "../services/image-uploads.js";
import { isSafePublicLink } from "../services/safe-links.js";

const idSchema = z.coerce.number().int().positive();
const categorySchema = z.enum(["web", "software", "network", "system", "consulting"]);
const statusSchema = z.enum(["draft", "published"]);
const paragraphArray = z.array(z.string().trim().min(10).max(10_000)).min(1).max(10);
const tupleArray = z.array(z.tuple([z.string().trim().min(2).max(160), z.string().trim().min(5).max(2_000)])).min(1).max(12);
const relatedLinkArray = z.array(z.tuple([
  z.string().trim().min(2).max(160),
  z.string().trim().min(1).max(2_000).refine(isSafePublicLink, "Bağlantı site içi bir yol veya güvenli bir HTTPS adresi olmalı."),
])).min(1).max(12);
const contentSchema = z.object({
  client: z.string().trim().min(2).max(220),
  industry: z.string().trim().min(2).max(220),
  services: z.string().trim().min(2).max(500),
  reportStatus: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(40),
  visualLabel: z.string().trim().min(2).max(160),
  visualCaption: z.string().trim().min(2).max(300),
  need: paragraphArray,
  approach: paragraphArray,
  solution: paragraphArray,
  technicalIntro: z.string().trim().min(10).max(5_000),
  architecture: tupleArray,
  technicalNote: z.string().trim().min(10).max(5_000),
  process: tupleArray,
  outcomeLead: z.string().trim().min(10).max(2_000),
  outcome: paragraphArray,
  related: relatedLinkArray,
});
const projectSchema = z.object({
  title: z.string().trim().min(3).max(220),
  slug: z.string().trim().min(3).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(30).max(800),
  category: categorySchema,
  status: statusSchema,
  imagePath: z.string().trim().max(2_000).refine(
    (value) => value.startsWith("/assets/images/") || isManagedUploadPath(value),
    "Geçersiz görsel yolu."
  ).nullable(),
  seoTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(180),
  imageAlt: z.string().trim().max(300),
  sortOrder: z.number().int().min(0).max(1_000_000),
  publishedAt: z.string().datetime({ offset: true }).nullable(),
  content: contentSchema,
}).superRefine((project, context) => {
  if (project.status !== "published") return;
  const required = [
    ["imagePath", project.imagePath, "Yayın için kapak görseli yükleyin."],
    ["imageAlt", project.imageAlt.length >= 5, "Yayın için görsel açıklaması en az 5 karakter olmalı."],
    ["seoTitle", project.seoTitle.length >= 15, "SEO başlığı en az 15 karakter olmalı."],
    ["metaDescription", project.metaDescription.length >= 50, "Meta açıklaması en az 50 karakter olmalı."],
    ["content.related", project.content.related.length >= 1, "En az bir ilgili hizmet bağlantısı gerekli."],
  ];
  required.forEach(([path, valid, message]) => {
    if (!valid) context.addIssue({ code: "custom", path: String(path).split("."), message });
  });
});

const categoryLabels = Object.freeze({ web: "Web", software: "Yazılım", network: "Network", system: "Sistem", consulting: "Teknoloji Danışmanlığı" });

function optionalValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeBody(body) {
  const rawPublishedAt = optionalValue(body.publishedAt);
  const date = rawPublishedAt ? new Date(rawPublishedAt) : null;
  return {
    title: String(body.title ?? ""), slug: String(body.slug ?? "").trim().toLowerCase(),
    summary: String(body.summary ?? ""), category: String(body.category ?? ""), status: String(body.status ?? ""),
    imagePath: optionalValue(body.imagePath), sortOrder: Number(body.sortOrder),
    seoTitle: String(body.seoTitle ?? ""), metaDescription: String(body.metaDescription ?? ""),
    imageAlt: String(body.imageAlt ?? ""),
    publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : rawPublishedAt,
    content: body.content,
  };
}

function serialize(row, detail = false) {
  const item = {
    id: String(row.id), title: row.title, slug: row.slug, summary: row.summary,
    category: row.category, categoryLabel: categoryLabels[row.category] || row.category,
    status: row.status, imagePath: row.image_path, sortOrder: row.sort_order,
    seoTitle: row.seo_title || "", metaDescription: row.meta_description || "", imageAlt: row.image_alt || "",
    publishedAt: row.published_at, createdAt: row.created_at, updatedAt: row.updated_at,
  };
  if (detail) item.content = row.content;
  return item;
}

function validationError(response, parsed) {
  return response.status(422).json({
    error: "validation_failed",
    message: "Referans alanlarını kontrol edin.",
    fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
  });
}

function conflictError(error, response) {
  if (error.code !== "23505") return false;
  response.status(409).json({ error: "slug_conflict", message: "Bu URL kısa adı başka bir referansta kullanılıyor." });
  return true;
}

const returning = `id, title, slug, summary, category, status, image_path, seo_title, meta_description,
  image_alt, sort_order, content, published_at, created_at, updated_at`;
export const adminProjectsRouter = Router();
adminProjectsRouter.use(requireAdmin);
adminProjectsRouter.use((_request, response, next) => { response.set("Cache-Control", "no-store"); next(); });

adminProjectsRouter.get("/", async (request, response) => {
  const status = ["draft", "published"].includes(request.query.status) ? request.query.status : null;
  const category = ["web", "software", "network", "system", "consulting"].includes(request.query.category) ? request.query.category : null;
  const search = String(request.query.search || "").trim().slice(0, 160);
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 100, 1), 100);
  const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
  const filters = `deleted_at IS NULL AND ($1::varchar IS NULL OR status = $1) AND ($2::varchar IS NULL OR category = $2)
    AND ($3::text = '' OR title ILIKE '%' || $3 || '%' OR slug ILIKE '%' || $3 || '%' OR summary ILIKE '%' || $3 || '%')`;
  const [countResult, countsResult] = await Promise.all([
    database.query(`SELECT COUNT(*)::integer AS total FROM projects WHERE ${filters}`, [status, category, search]),
    database.query(`SELECT COUNT(*)::integer AS total, COUNT(*) FILTER (WHERE status='draft')::integer AS draft, COUNT(*) FILTER (WHERE status='published')::integer AS published FROM projects WHERE deleted_at IS NULL`),
  ]);
  const total = countResult.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const result = await database.query(
    `SELECT ${returning} FROM projects WHERE ${filters} ORDER BY sort_order ASC, updated_at DESC LIMIT $4 OFFSET $5`,
    [status, category, search, limit, (safePage - 1) * limit]
  );
  return response.json({ ok: true, items: result.rows.map((row) => serialize(row)), counts: countsResult.rows[0], pagination: { page: safePage, limit, total, totalPages } });
});

adminProjectsRouter.get("/:id", async (request, response) => {
  const id = idSchema.safeParse(request.params.id);
  if (!id.success) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  const result = await database.query(`SELECT ${returning} FROM projects WHERE id=$1 AND deleted_at IS NULL`, [id.data]);
  if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  return response.json({ ok: true, item: serialize(result.rows[0], true) });
});

adminProjectsRouter.post("/", async (request, response) => {
  const parsed = projectSchema.safeParse(normalizeBody(request.body));
  if (!parsed.success) return validationError(response, parsed);
  const item = parsed.data;
  try {
    const result = await database.query(
      `INSERT INTO projects (title,slug,summary,category,status,image_path,seo_title,meta_description,image_alt,sort_order,content,published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,CASE WHEN $5::varchar='published' THEN COALESCE($12::timestamptz,NOW()) ELSE NULL END)
       RETURNING ${returning}`,
      [item.title,item.slug,item.summary,item.category,item.status,item.imagePath,item.seoTitle,item.metaDescription,item.imageAlt,
        item.sortOrder,JSON.stringify(item.content),item.publishedAt]
    );
    return response.status(201).json({ ok: true, item: serialize(result.rows[0], true) });
  } catch (error) { if (conflictError(error, response)) return undefined; throw error; }
});

adminProjectsRouter.patch("/:id", async (request, response) => {
  const id = idSchema.safeParse(request.params.id);
  const parsed = projectSchema.safeParse(normalizeBody(request.body));
  if (!id.success) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  if (!parsed.success) return validationError(response, parsed);
  const item = parsed.data;
  try {
    const result = await database.query(
      `UPDATE projects SET title=$2,slug=$3,summary=$4,category=$5,status=$6,image_path=$7,seo_title=$8,
       meta_description=$9,image_alt=$10,sort_order=$11,content=$12::jsonb,
       published_at=CASE WHEN $6::varchar='published' THEN COALESCE($13::timestamptz,published_at,NOW()) ELSE NULL END,
       import_source=NULL,import_checksum=NULL,imported_at=NULL
       WHERE id=$1 AND deleted_at IS NULL RETURNING ${returning}`,
      [id.data,item.title,item.slug,item.summary,item.category,item.status,item.imagePath,item.seoTitle,item.metaDescription,item.imageAlt,
        item.sortOrder,JSON.stringify(item.content),item.publishedAt]
    );
    if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
    return response.json({ ok: true, item: serialize(result.rows[0], true) });
  } catch (error) { if (conflictError(error, response)) return undefined; throw error; }
});

adminProjectsRouter.patch("/:id/order", async (request, response) => {
  const id = idSchema.safeParse(request.params.id);
  const order = z.coerce.number().int().min(0).max(1_000_000).safeParse(request.body.sortOrder);
  if (!id.success || !order.success) return response.status(422).json({ error: "validation_failed", message: "Sıralama değeri geçerli değil." });
  const result = await database.query(`UPDATE projects SET sort_order=$2,import_source=NULL,import_checksum=NULL,imported_at=NULL WHERE id=$1 AND deleted_at IS NULL RETURNING id,sort_order`, [id.data, order.data]);
  if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  return response.json({ ok: true, id: String(result.rows[0].id), sortOrder: result.rows[0].sort_order });
});

adminProjectsRouter.delete("/:id", async (request, response) => {
  const id = idSchema.safeParse(request.params.id);
  if (!id.success) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  const result = await database.query(`UPDATE projects SET deleted_at=NOW(),import_source=NULL,import_checksum=NULL,imported_at=NULL WHERE id=$1 AND deleted_at IS NULL RETURNING id`, [id.data]);
  if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  return response.json({ ok: true, message: "Referans silindi." });
});
