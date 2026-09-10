import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const defaultStaticBlogSource = resolve(
  moduleDirectory,
  "..",
  "..",
  "..",
  "assets",
  "data",
  "seed-data.js"
);

const allowedCategories = new Set([
  "web",
  "software",
  "network",
  "system",
  "transformation",
  "consulting",
]);

const allowedStatuses = new Set(["draft", "published"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requiredText(value, field, maximumLength = Infinity) {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(`Blog alanı boş olamaz: ${field}`);
  if (normalized.length > maximumLength) {
    throw new Error(`Blog alanı çok uzun: ${field} (${normalized.length}/${maximumLength})`);
  }
  return normalized;
}

function optionalImagePath(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim();
  if (!normalized.startsWith("/assets/")) {
    throw new Error(`Blog görsel yolu /assets/ ile başlamalı: ${normalized}`);
  }
  return normalized;
}

function publicationDate(value, status, slug) {
  if ((value === undefined || value === null || value === "") && status === "draft") return null;
  const normalized = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || Number.isNaN(Date.parse(`${normalized}T00:00:00Z`))) {
    throw new Error(`Geçersiz blog yayın tarihi (${slug}): ${normalized || "boş"}`);
  }
  return normalized;
}

function checksum(post) {
  const content = JSON.stringify([
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.category,
    post.status,
    post.imagePath,
    post.publishedAt,
  ]);
  return createHash("sha256").update(content).digest("hex");
}

export function validateStaticBlogPosts(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Statik blog kaynağında aktarılacak yazı bulunamadı.");
  }

  const seenSlugs = new Set();
  return posts.map((rawPost, index) => {
    const label = `yazı ${index + 1}`;
    const title = requiredText(rawPost?.title, `${label}.title`, 220);
    const slug = requiredText(rawPost?.slug, `${label}.slug`, 220);
    const excerpt = requiredText(rawPost?.excerpt, `${label}.excerpt`, 500);
    const content = requiredText(rawPost?.content, `${label}.content`);
    const category = requiredText(rawPost?.category, `${label}.category`, 40);
    const status = requiredText(rawPost?.status || "draft", `${label}.status`, 20);

    if (!slugPattern.test(slug)) throw new Error(`Geçersiz blog slug değeri: ${slug}`);
    if (seenSlugs.has(slug)) throw new Error(`Tekrarlanan blog slug değeri: ${slug}`);
    if (!allowedCategories.has(category)) throw new Error(`Geçersiz blog kategorisi (${slug}): ${category}`);
    if (!allowedStatuses.has(status)) throw new Error(`Geçersiz blog durumu (${slug}): ${status}`);
    seenSlugs.add(slug);

    const post = {
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      imagePath: optionalImagePath(rawPost.image),
      publishedAt: publicationDate(rawPost.publishedAt, status, slug),
    };
    return Object.freeze({ ...post, sourceChecksum: checksum(post) });
  });
}

export async function loadStaticBlogPosts(sourcePath = defaultStaticBlogSource) {
  const source = await readFile(sourcePath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, {
    filename: sourcePath,
    timeout: 2_000,
    displayErrors: true,
  });
  return validateStaticBlogPosts(sandbox.window.StaticBlogPosts);
}

