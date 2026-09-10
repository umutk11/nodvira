import { Router } from "express";
import { z } from "zod";
import { database } from "../db.js";

const categorySchema = z.enum([
  "web",
  "software",
  "network",
  "system",
  "transformation",
  "consulting",
]);

const listQuerySchema = z.object({
  search: z.string().trim().max(160),
  category: categorySchema.nullable(),
  page: z.number().int().min(1).max(10_000),
  limit: z.number().int().min(1).max(100),
});

const slugSchema = z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const categoryLabels = Object.freeze({
  web: "Web Teknolojileri",
  software: "Yazılım",
  network: "Network",
  system: "Sistem",
  transformation: "Dijital Dönüşüm",
  consulting: "Teknoloji Danışmanlığı",
});

function normalizeListQuery(query) {
  const rawCategory = String(query.category || "").trim();
  return listQuerySchema.safeParse({
    search: String(query.search || "").trim(),
    category: !rawCategory || rawCategory === "all" ? null : rawCategory,
    page: Number(query.page || 1),
    limit: Number(query.limit || 9),
  });
}

function serializeSummary(row) {
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.category,
    categoryLabel: categoryLabels[row.category] || row.category,
    status: "published",
    image: row.image_path,
    seoTitle: row.seo_title || row.title,
    metaDescription: row.meta_description || row.excerpt,
    imageAlt: row.image_alt || "",
    authorName: row.author_name || "NODVIRA",
    reviewerName: row.reviewer_name,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingTimeMinutes: Number(row.reading_time_minutes) || 1,
  };
}

function serializeDetail(row) {
  return {
    ...serializeSummary(row),
    content: row.content,
  };
}

export const blogPostsRouter = Router();

blogPostsRouter.get("/", async (request, response) => {
  const parsed = normalizeListQuery(request.query);
  if (!parsed.success) {
    return response.status(422).json({
      error: "validation_failed",
      message: "Blog filtreleri geçerli değil.",
      fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
  }

  const { search, category, page, limit } = parsed.data;
  const filters = `status = 'published' AND deleted_at IS NULL
    AND ($1::varchar IS NULL OR category = $1)
    AND ($2::text = ''
      OR title ILIKE '%' || $2 || '%'
      OR excerpt ILIKE '%' || $2 || '%'
      OR content ILIKE '%' || $2 || '%')`;

  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM blog_posts
     WHERE ${filters}`,
    [category, search]
  );
  const total = countResult.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  const itemsResult = await database.query(
    `SELECT id, title, slug, excerpt, category, image_path, seo_title, meta_description,
            image_alt, author_name, reviewer_name, published_at, updated_at,
            GREATEST(
              1,
              CEIL(COALESCE(array_length(regexp_split_to_array(BTRIM(content), E'\\s+'), 1), 0) / 200.0)
            )::integer AS reading_time_minutes
     FROM blog_posts
     WHERE ${filters}
     ORDER BY published_at DESC NULLS LAST, id DESC
     LIMIT $3 OFFSET $4`,
    [category, search, limit, offset]
  );

  response.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  return response.json({
    ok: true,
    items: itemsResult.rows.map(serializeSummary),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasPrevious: safePage > 1,
      hasNext: safePage < totalPages,
    },
    filters: { search, category: category || "all" },
  });
});

blogPostsRouter.get("/:slug", async (request, response) => {
  const parsedSlug = slugSchema.safeParse(request.params.slug);
  if (!parsedSlug.success) {
    return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });
  }

  const result = await database.query(
    `SELECT id, title, slug, excerpt, content, category, image_path, seo_title, meta_description,
            image_alt, author_name, reviewer_name, published_at, updated_at,
            GREATEST(
              1,
              CEIL(COALESCE(array_length(regexp_split_to_array(BTRIM(content), E'\\s+'), 1), 0) / 200.0)
            )::integer AS reading_time_minutes
     FROM blog_posts
     WHERE slug = $1 AND status = 'published' AND deleted_at IS NULL
     LIMIT 1`,
    [parsedSlug.data]
  );

  if (!result.rows[0]) {
    return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });
  }

  response.set("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
  return response.json({ ok: true, item: serializeDetail(result.rows[0]) });
});
