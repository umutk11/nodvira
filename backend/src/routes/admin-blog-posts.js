import { Router } from "express";
import { z } from "zod";
import { database } from "../db.js";
import { requireAdmin } from "../middleware/admin-auth.js";
import { isManagedUploadPath } from "../services/image-uploads.js";

const idSchema = z.coerce.number().int().positive();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categorySchema = z.enum(["web", "software", "network", "system", "transformation", "consulting"]);
const statusSchema = z.enum(["draft", "published"]);

const postSchema = z.object({
  title: z.string().trim().min(3).max(220),
  slug: z.string().trim().min(3).max(220).regex(slugPattern),
  excerpt: z.string().trim().min(20).max(500),
  content: z.string().trim().min(50).max(200_000),
  category: categorySchema,
  status: statusSchema,
  imagePath: z.string().trim().max(2_000).refine(
    (value) => value.startsWith("/assets/images/") || isManagedUploadPath(value),
    "Geçersiz görsel yolu."
  ).nullable(),
  seoTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(180),
  imageAlt: z.string().trim().max(300),
  authorName: z.string().trim().max(160),
  reviewerName: z.string().trim().max(160).nullable(),
  publishedAt: z.string().datetime({ offset: true }).nullable(),
}).superRefine((post, context) => {
  if (post.status !== "published") return;
  const required = [
    ["imagePath", post.imagePath, "Yayın için kapak görseli yükleyin."],
    ["imageAlt", post.imageAlt.length >= 5, "Yayın için görsel açıklaması en az 5 karakter olmalı."],
    ["seoTitle", post.seoTitle.length >= 15, "SEO başlığı en az 15 karakter olmalı."],
    ["metaDescription", post.metaDescription.length >= 50, "Meta açıklaması en az 50 karakter olmalı."],
    ["authorName", post.authorName.length >= 2, "Yazar veya yayınlayan adı gerekli."],
    ["content", post.content.length >= 300, "Yayın içeriği en az 300 karakter olmalı."],
    ["content", /^##\s+\S/m.test(post.content), "İçerikte en az bir H2 bölüm başlığı (##) bulunmalı."],
    ["content", !/^#\s+\S/m.test(post.content), "Sayfa H1'i başlıktan üretilir; içerikte tek # başlık kullanmayın."],
  ];
  required.forEach(([path, valid, message]) => {
    if (!valid) context.addIssue({ code: "custom", path: [path], message });
  });
});

const listQuerySchema = z.object({
  search: z.string().trim().max(160),
  category: categorySchema.nullable(),
  status: statusSchema.nullable(),
  page: z.number().int().min(1).max(10_000),
  limit: z.number().int().min(1).max(100),
});

const categoryLabels = Object.freeze({
  web: "Web Teknolojileri",
  software: "Yazılım",
  network: "Network",
  system: "Sistem",
  transformation: "Dijital Dönüşüm",
  consulting: "Teknoloji Danışmanlığı",
});

function optionalValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizePostBody(body) {
  const imagePath = optionalValue(body.imagePath);
  const rawPublishedAt = optionalValue(body.publishedAt);
  const publishedDate = rawPublishedAt ? new Date(rawPublishedAt) : null;
  return {
    title: String(body.title ?? ""),
    slug: String(body.slug ?? "").trim().toLowerCase(),
    excerpt: String(body.excerpt ?? ""),
    content: String(body.content ?? ""),
    category: String(body.category ?? ""),
    status: String(body.status ?? ""),
    imagePath,
    seoTitle: String(body.seoTitle ?? ""),
    metaDescription: String(body.metaDescription ?? ""),
    imageAlt: String(body.imageAlt ?? ""),
    authorName: String(body.authorName ?? ""),
    reviewerName: optionalValue(body.reviewerName),
    publishedAt: publishedDate && !Number.isNaN(publishedDate.getTime()) ? publishedDate.toISOString() : rawPublishedAt,
  };
}

function normalizeListQuery(query) {
  const rawCategory = optionalValue(query.category);
  const rawStatus = optionalValue(query.status);
  return listQuerySchema.safeParse({
    search: String(query.search || "").trim(),
    category: rawCategory === "all" ? null : rawCategory,
    status: rawStatus === "all" ? null : rawStatus,
    page: Number(query.page || 1),
    limit: Number(query.limit || 20),
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
    status: row.status,
    imagePath: row.image_path,
    seoTitle: row.seo_title || "",
    metaDescription: row.meta_description || "",
    imageAlt: row.image_alt || "",
    authorName: row.author_name || "",
    reviewerName: row.reviewer_name,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeDetail(row) {
  return { ...serializeSummary(row), content: row.content };
}

function validationError(response, parsed) {
  return response.status(422).json({
    error: "validation_failed",
    message: "Blog yazısındaki alanları kontrol edin.",
    fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
  });
}

function conflictError(error, response) {
  if (error.code !== "23505") return false;
  response.status(409).json({
    error: "slug_conflict",
    message: "Bu URL kısa adı başka bir blog yazısında kullanılıyor.",
  });
  return true;
}

const returningFields = `id, title, slug, excerpt, content, category, status, image_path,
  seo_title, meta_description, image_alt, author_name, reviewer_name,
  published_at, created_at, updated_at`;

export const adminBlogPostsRouter = Router();
adminBlogPostsRouter.use(requireAdmin);
adminBlogPostsRouter.use((_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});

adminBlogPostsRouter.get("/", async (request, response) => {
  const parsed = normalizeListQuery(request.query);
  if (!parsed.success) return validationError(response, parsed);

  const { search, category, status, page, limit } = parsed.data;
  const filters = `deleted_at IS NULL
    AND ($1::varchar IS NULL OR category = $1)
    AND ($2::varchar IS NULL OR status = $2)
    AND ($3::text = ''
      OR title ILIKE '%' || $3 || '%'
      OR slug ILIKE '%' || $3 || '%'
      OR excerpt ILIKE '%' || $3 || '%')`;

  const [countResult, statusCountsResult] = await Promise.all([
    database.query(`SELECT COUNT(*)::integer AS total FROM blog_posts WHERE ${filters}`, [category, status, search]),
    database.query(
      `SELECT COUNT(*)::integer AS total,
              COUNT(*) FILTER (WHERE status = 'draft')::integer AS draft,
              COUNT(*) FILTER (WHERE status = 'published')::integer AS published
       FROM blog_posts WHERE deleted_at IS NULL`
    ),
  ]);

  const total = countResult.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  const result = await database.query(
    `SELECT id, title, slug, excerpt, category, status, image_path,
            seo_title, meta_description, image_alt, author_name, reviewer_name,
            published_at, created_at, updated_at
     FROM blog_posts
     WHERE ${filters}
     ORDER BY updated_at DESC, id DESC
     LIMIT $4 OFFSET $5`,
    [category, status, search, limit, offset]
  );

  return response.json({
    ok: true,
    items: result.rows.map(serializeSummary),
    counts: statusCountsResult.rows[0],
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasPrevious: safePage > 1,
      hasNext: safePage < totalPages,
    },
  });
});

adminBlogPostsRouter.get("/:id", async (request, response) => {
  const parsedId = idSchema.safeParse(request.params.id);
  if (!parsedId.success) return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });

  const result = await database.query(
    `SELECT ${returningFields}
     FROM blog_posts
     WHERE id = $1 AND deleted_at IS NULL`,
    [parsedId.data]
  );
  if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });
  return response.json({ ok: true, item: serializeDetail(result.rows[0]) });
});

adminBlogPostsRouter.post("/", async (request, response) => {
  const parsed = postSchema.safeParse(normalizePostBody(request.body));
  if (!parsed.success) return validationError(response, parsed);
  const post = parsed.data;

  try {
    const result = await database.query(
      `INSERT INTO blog_posts
        (title, slug, excerpt, content, category, status, image_path, seo_title,
         meta_description, image_alt, author_name, reviewer_name, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
         CASE WHEN $6::varchar = 'published' THEN COALESCE($13::timestamptz, NOW()) ELSE NULL END)
       RETURNING ${returningFields}`,
      [post.title, post.slug, post.excerpt, post.content, post.category, post.status, post.imagePath,
        post.seoTitle, post.metaDescription, post.imageAlt, post.authorName, post.reviewerName, post.publishedAt]
    );
    return response.status(201).json({ ok: true, item: serializeDetail(result.rows[0]) });
  } catch (error) {
    if (conflictError(error, response)) return undefined;
    throw error;
  }
});

adminBlogPostsRouter.patch("/:id", async (request, response) => {
  const parsedId = idSchema.safeParse(request.params.id);
  const parsed = postSchema.safeParse(normalizePostBody(request.body));
  if (!parsedId.success) return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });
  if (!parsed.success) return validationError(response, parsed);
  const post = parsed.data;

  try {
    const result = await database.query(
      `UPDATE blog_posts SET
         title = $2,
         slug = $3,
         excerpt = $4,
         content = $5,
         category = $6,
         status = $7,
         image_path = $8,
         seo_title = $9,
         meta_description = $10,
         image_alt = $11,
         author_name = $12,
         reviewer_name = $13,
         published_at = CASE
           WHEN $7::varchar = 'published' THEN COALESCE($14::timestamptz, published_at, NOW())
           ELSE NULL
         END,
         import_source = NULL,
         import_checksum = NULL,
         imported_at = NULL
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING ${returningFields}`,
      [parsedId.data, post.title, post.slug, post.excerpt, post.content, post.category, post.status,
        post.imagePath, post.seoTitle, post.metaDescription, post.imageAlt, post.authorName, post.reviewerName, post.publishedAt]
    );
    if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });
    return response.json({ ok: true, item: serializeDetail(result.rows[0]) });
  } catch (error) {
    if (conflictError(error, response)) return undefined;
    throw error;
  }
});

adminBlogPostsRouter.delete("/:id", async (request, response) => {
  const parsedId = idSchema.safeParse(request.params.id);
  if (!parsedId.success) return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });

  const result = await database.query(
    `UPDATE blog_posts
     SET deleted_at = NOW(), import_source = NULL, import_checksum = NULL, imported_at = NULL
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [parsedId.data]
  );
  if (!result.rows[0]) return response.status(404).json({ error: "not_found", message: "Blog yazısı bulunamadı." });
  return response.json({ ok: true, message: "Blog yazısı silindi." });
});
