import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";
import { database } from "../src/db.js";

const row = {
  id: 12,
  title: "Kurumsal Ağlarda Performans ve Güvenlik Dengesi",
  slug: "kurumsal-aglarda-performans-ve-guvenlik-dengesi",
  excerpt: "Örnek açıklama",
  content: "## İçerik\n\nÖrnek teknik içerik.",
  category: "network",
  image_path: "/assets/images/blog/network-performance-security.webp",
  published_at: "2026-08-12T00:00:00.000Z",
  updated_at: "2026-08-12T00:00:00.000Z",
  reading_time_minutes: 7,
};

async function withServer(queryHandler, callback) {
  const originalQuery = database.query;
  database.query = queryHandler;
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const { port } = server.address();
  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    database.query = originalQuery;
  }
}

test("blog listesi kategori, arama ve sayfalamayı PostgreSQL sorgusuna taşır", async () => {
  const calls = [];
  await withServer(async (sql, parameters) => {
    calls.push({ sql, parameters });
    if (sql.includes("COUNT(*)")) return { rows: [{ total: 3 }] };
    return { rows: [row] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/blog-posts?category=network&search=güvenlik&page=2&limit=2`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.items[0].slug, row.slug);
    assert.equal(body.items[0].readingTimeMinutes, 7);
    assert.deepEqual(body.pagination, {
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasPrevious: true,
      hasNext: false,
    });
    assert.deepEqual(calls[0].parameters, ["network", "güvenlik"]);
    assert.deepEqual(calls[1].parameters, ["network", "güvenlik", 2, 2]);
  });
});

test("blog detayında yalnızca yayınlanmış yazıyı döndürür", async () => {
  await withServer(async (sql, parameters) => {
    assert.match(sql, /status = 'published'/);
    assert.deepEqual(parameters, [row.slug]);
    return { rows: [row] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/blog-posts/${row.slug}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.item.content, row.content);
    assert.equal(body.item.image, row.image_path);
    assert.equal(body.item.status, "published");
  });
});

test("geçersiz kategori veritabanına sorgu göndermeden reddedilir", async () => {
  let queried = false;
  await withServer(async () => {
    queried = true;
    return { rows: [] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/blog-posts?category=invalid`);
    assert.equal(response.status, 422);
    assert.equal(queried, false);
  });
});
