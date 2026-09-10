import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { adminBlogPostsRouter } from "../src/routes/admin-blog-posts.js";
import { database } from "../src/db.js";

const postBody = {
  title: "Kurumsal Ağlarda Segmentasyon Rehberi",
  slug: "kurumsal-aglarda-segmentasyon-rehberi",
  excerpt: "Kurumsal ağ segmentasyonu için uygulanabilir ve ölçülebilir yaklaşım.",
  content: "## Başlangıç\n\nKurumsal ağ segmentasyonu trafik, kimlik, risk ve işletim sorumlulukları birlikte değerlendirilerek planlanmalıdır. Mevcut cihaz envanteri, kullanıcı rolleri, kritik servisler ve dış bağlantılar doğrulanmadan yalnızca ağ cihazları üzerinden bölümleme yapmak sürdürülebilir bir güvenlik modeli oluşturmaz.\n\n## Uygulama\n\nGeçiş planı erişim kuralları, izleme, geri dönüş senaryosu ve kabul kontrolleriyle birlikte hazırlanmalıdır. Böylece güvenlik kazanımı ölçülürken iş sürekliliği de korunabilir.",
  category: "network",
  status: "published",
  imagePath: "/assets/images/blog/network-performance-security.webp",
  imageAlt: "Kurumsal ağ segmentasyonu teknik şeması",
  seoTitle: "Kurumsal Ağlarda Segmentasyon Rehberi | NODVIRA",
  metaDescription: "Kurumsal ağ segmentasyonunu güvenlik, performans ve işletim ihtiyaçlarıyla birlikte planlamak için uygulanabilir teknik rehber.",
  authorName: "NODVIRA",
  reviewerName: "Teknik Ekip",
  publishedAt: "2026-08-28T09:00:00.000Z",
};

const databaseRow = {
  id: 44,
  title: postBody.title,
  slug: postBody.slug,
  excerpt: postBody.excerpt,
  content: postBody.content,
  category: postBody.category,
  status: postBody.status,
  image_path: postBody.imagePath,
  image_alt: postBody.imageAlt,
  seo_title: postBody.seoTitle,
  meta_description: postBody.metaDescription,
  author_name: postBody.authorName,
  reviewer_name: postBody.reviewerName,
  published_at: postBody.publishedAt,
  created_at: "2026-08-28T09:00:00.000Z",
  updated_at: "2026-08-28T09:00:00.000Z",
};

async function withAdminServer(queryHandler, callback, { authenticated = true } = {}) {
  const originalQuery = database.query;
  database.query = queryHandler;
  const app = express();
  app.use(express.json());
  if (authenticated) app.use((request, _response, next) => {
    request.session = { admin: { id: "1", role: "admin" } };
    next();
  });
  app.use("/api/admin/blog-posts", adminBlogPostsRouter);
  const server = app.listen(0, "127.0.0.1");
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

test("admin blog uçları oturum olmadan kullanılamaz", async () => {
  let queried = false;
  await withAdminServer(async () => {
    queried = true;
    return { rows: [] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts`);
    assert.equal(response.status, 401);
    assert.equal(queried, false);
  }, { authenticated: false });
});

test("yeni blog yazısı oluşturur ve ilk yayın tarihini kaydeder", async () => {
  await withAdminServer(async (sql, parameters) => {
    assert.match(sql, /INSERT INTO blog_posts/);
    assert.deepEqual(parameters, [
      postBody.title,
      postBody.slug,
      postBody.excerpt,
      postBody.content,
      postBody.category,
      postBody.status,
      postBody.imagePath,
      postBody.seoTitle,
      postBody.metaDescription,
      postBody.imageAlt,
      postBody.authorName,
      postBody.reviewerName,
      postBody.publishedAt,
    ]);
    return { rows: [databaseRow] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postBody),
    });
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.item.status, "published");
    assert.equal(body.item.slug, postBody.slug);
  });
});

test("SEO zorunlulukları tamamlanmadan blog yazısını yayınlamaz", async () => {
  let queried = false;
  await withAdminServer(async () => { queried = true; return { rows: [] }; }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...postBody, imagePath: null, imageAlt: "", seoTitle: "", metaDescription: "" }),
    });
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.ok(body.fields.includes("imagePath"));
    assert.equal(queried, false);
  });
});

test("SEO alanları eksikken blog taslağını kaydedebilir", async () => {
  const draftBody = { ...postBody, status: "draft", imagePath: null, imageAlt: "", seoTitle: "", metaDescription: "", authorName: "", reviewerName: null, publishedAt: null };
  const draftRow = { ...databaseRow, status: "draft", image_path: null, image_alt: "", seo_title: "", meta_description: "", author_name: "", reviewer_name: null, published_at: null };
  await withAdminServer(async (sql) => {
    assert.match(sql, /INSERT INTO blog_posts/);
    return { rows: [draftRow] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draftBody),
    });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).item.status, "draft");
  });
});

test("blog yazısını düzenlerken statik import bağını kaldırır", async () => {
  const updated = { ...databaseRow, status: "draft", published_at: null };
  await withAdminServer(async (sql, parameters) => {
    assert.match(sql, /UPDATE blog_posts SET/);
    assert.match(sql, /import_source = NULL/);
    assert.equal(parameters[0], 44);
    assert.equal(parameters[6], "draft");
    return { rows: [updated] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts/44`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...postBody, status: "draft", publishedAt: null }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.item.status, "draft");
  });
});

test("aynı URL kısa adı kullanıldığında anlaşılır çakışma yanıtı verir", async () => {
  await withAdminServer(async () => {
    const error = new Error("duplicate key");
    error.code = "23505";
    throw error;
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postBody),
    });
    assert.equal(response.status, 409);
    const body = await response.json();
    assert.equal(body.error, "slug_conflict");
  });
});

test("silme işlemi kaydı geri alınabilir biçimde görünmez yapar", async () => {
  await withAdminServer(async (sql, parameters) => {
    assert.match(sql, /deleted_at = NOW\(\)/);
    assert.match(sql, /import_source = NULL/);
    assert.deepEqual(parameters, [44]);
    return { rows: [{ id: 44 }] };
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/blog-posts/44`, { method: "DELETE" });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
  });
});
