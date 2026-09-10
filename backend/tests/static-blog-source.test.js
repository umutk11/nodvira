import assert from "node:assert/strict";
import test from "node:test";
import { loadStaticBlogPosts, validateStaticBlogPosts } from "../src/services/static-blog-source.js";

test("mevcut statik blog kaynağındaki tüm yazıları doğrular", async () => {
  const posts = await loadStaticBlogPosts();
  assert.equal(posts.length, 6);
  assert.equal(new Set(posts.map((post) => post.slug)).size, posts.length);
  assert.ok(posts.every((post) => post.status === "published"));
  assert.ok(posts.every((post) => post.sourceChecksum.length === 64));
  assert.ok(posts.every((post) => post.imagePath?.startsWith("/assets/images/blog/")));
});

test("tekrarlanan slug değerini reddeder", () => {
  const post = {
    title: "Örnek Yazı",
    slug: "ornek-yazi",
    excerpt: "Örnek blog açıklaması.",
    content: "## İçerik\n\nYeterli içerik.",
    category: "web",
    image: "/assets/images/blog/ornek.webp",
    status: "published",
    publishedAt: "2026-08-01",
  };
  assert.throws(() => validateStaticBlogPosts([post, post]), /Tekrarlanan blog slug/);
});

test("desteklenmeyen kategori ve hatalı görsel yolunu reddeder", () => {
  const basePost = {
    title: "Örnek Yazı",
    slug: "ornek-yazi",
    excerpt: "Örnek blog açıklaması.",
    content: "## İçerik\n\nYeterli içerik.",
    category: "web",
    image: "/assets/images/blog/ornek.webp",
    status: "published",
    publishedAt: "2026-08-01",
  };
  assert.throws(
    () => validateStaticBlogPosts([{ ...basePost, category: "other" }]),
    /Geçersiz blog kategorisi/
  );
  assert.throws(
    () => validateStaticBlogPosts([{ ...basePost, image: "https://example.com/image.webp" }]),
    /görsel yolu/
  );
});

