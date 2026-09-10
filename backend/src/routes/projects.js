import { Router } from "express";
import { z } from "zod";
import { database } from "../db.js";

const categorySchema = z.enum(["web", "software", "network", "system", "consulting"]);
const slugSchema = z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const listQuerySchema = z.object({
  search: z.string().trim().max(160),
  category: categorySchema.nullable(),
  page: z.number().int().min(1).max(10_000),
  limit: z.number().int().min(1).max(100),
});

const categoryLabels = Object.freeze({
  web: "Web",
  software: "Yazılım",
  network: "Network",
  system: "Sistem",
  consulting: "Teknoloji Danışmanlığı",
});

function normalizeListQuery(query) {
  const rawCategory = String(query.category || "").trim();
  return listQuerySchema.safeParse({
    search: String(query.search || "").trim(),
    category: !rawCategory || rawCategory === "all" ? null : rawCategory,
    page: Number(query.page || 1),
    limit: Number(query.limit || 5),
  });
}

function serializeSummary(row) {
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    category: row.category,
    categoryLabel: categoryLabels[row.category] || row.category,
    imagePath: row.image_path,
    seoTitle: row.seo_title || row.title,
    metaDescription: row.meta_description || row.summary,
    imageAlt: row.image_alt || "",
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    visual: {
      label: row.content?.visualLabel || categoryLabels[row.category] || row.category,
      code: row.content?.code || "",
      caption: row.content?.visualCaption || "",
    },
  };
}

export const projectsRouter = Router();

projectsRouter.get("/", async (request, response) => {
  const parsed = normalizeListQuery(request.query);
  if (!parsed.success) return response.status(422).json({ error: "validation_failed", message: "Referans filtreleri geçerli değil." });
  const { search, category, page, limit } = parsed.data;
  const filters = `status = 'published' AND deleted_at IS NULL
    AND ($1::varchar IS NULL OR category = $1)
    AND ($2::text = '' OR title ILIKE '%' || $2 || '%' OR summary ILIKE '%' || $2 || '%')`;
  const countResult = await database.query(`SELECT COUNT(*)::integer AS total FROM projects WHERE ${filters}`, [category, search]);
  const total = countResult.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const result = await database.query(
    `SELECT id, title, slug, summary, category, image_path, seo_title, meta_description, image_alt,
            sort_order, content, published_at, updated_at
     FROM projects WHERE ${filters}
     ORDER BY sort_order ASC, published_at DESC NULLS LAST, id ASC
     LIMIT $3 OFFSET $4`,
    [category, search, limit, (safePage - 1) * limit]
  );
  response.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  return response.json({
    ok: true,
    items: result.rows.map(serializeSummary),
    pagination: { page: safePage, limit, total, totalPages, hasPrevious: safePage > 1, hasNext: safePage < totalPages },
    filters: { search, category: category || "all" },
  });
});

projectsRouter.get("/:slug", async (request, response) => {
  const parsedSlug = slugSchema.safeParse(request.params.slug);
  if (!parsedSlug.success) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });
  const result = await database.query(
    `SELECT id, title, slug, summary, category, image_path, seo_title, meta_description, image_alt,
            sort_order, content, published_at, updated_at
     FROM projects WHERE slug = $1 AND status = 'published' AND deleted_at IS NULL LIMIT 1`,
    [parsedSlug.data]
  );
  const row = result.rows[0];
  if (!row) return response.status(404).json({ error: "not_found", message: "Referans bulunamadı." });

  const navigationResult = await database.query(
    `SELECT title, slug FROM projects
     WHERE status = 'published' AND deleted_at IS NULL
     ORDER BY sort_order ASC, published_at DESC NULLS LAST, id ASC`
  );
  const index = navigationResult.rows.findIndex((item) => item.slug === row.slug);
  const length = navigationResult.rows.length;
  const previous = length ? navigationResult.rows[(index - 1 + length) % length] : null;
  const next = length ? navigationResult.rows[(index + 1) % length] : null;
  response.set("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
  return response.json({
    ok: true,
    item: { ...serializeSummary(row), content: row.content },
    navigation: { previous, next },
  });
});
