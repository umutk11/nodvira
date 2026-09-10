import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { database } from "../src/db.js";
import { loadStaticProjects } from "../src/services/static-project-source.js";
import { projectsRouter } from "../src/routes/projects.js";
import { adminProjectsRouter } from "../src/routes/admin-projects.js";

const row = {
  id: 7, title: "Örnek Kurumsal Web Projesi", slug: "ornek-kurumsal-web-projesi",
  summary: "Kurumsal içerik ve kullanıcı deneyimini ortak teknik yapıda birleştiren ayrıntılı anonim proje özeti.",
  category: "web", status: "published", image_path: null, sort_order: 10,
  seo_title: "Örnek Kurumsal Web Projesi | NODVIRA", meta_description: "Kurumsal içerik ve kullanıcı deneyimini ortak teknik yapıda birleştiren ayrıntılı anonim proje özeti ve uygulama yaklaşımı.", image_alt: null,
  content: { client: "Anonim müşteri", industry: "Profesyonel Hizmetler", services: "UX · Front-end", reportStatus: "Anonim vaka raporu", code: "WEB / 07", visualLabel: "Web platformu", visualCaption: "12 hizmet · 3 ekip", need: ["Mevcut yapı farklı ekiplerin içerik üretimini ve kullanıcıların doğru hizmete erişimini zorlaştırıyordu."], approach: ["İçerik envanteri, kullanıcı görevleri ve teknik gereksinimler ortak modelde değerlendirildi."], solution: ["Yeniden kullanılabilir bileşenler ve yapılandırılmış içerik modeli üzerinde yeni platform geliştirildi."], technicalIntro: "Teknik yaklaşım içerik, deneyim ve ölçüm katmanlarını birlikte ele aldı.", architecture: [["İçerik", "Yapılandırılmış içerik modeli ve yayın kuralları."]], technicalNote: "Teknoloji seçimi bakım ve performans hedeflerine göre yapıldı.", process: [["Keşif", "İhtiyaçlar ve bağımlılıklar doğrulandı."]], outcomeLead: "İçerik yönetimi ve kullanıcı yolculukları ortak yapıda toplandı.", outcome: ["Ekipler aynı yayın standardı üzerinden çalışabilir hale geldi."], related: [["Web Çözümleri", "/hizmetlerimiz/web-cozumleri"]] },
  published_at: "2026-08-20T00:00:00.000Z", created_at: "2026-08-20T00:00:00.000Z", updated_at: "2026-08-20T00:00:00.000Z",
};

async function serverFor(router, queryHandler, callback, authenticated = false) {
  const originalQuery = database.query; database.query = queryHandler;
  const app = express(); app.use(express.json());
  if (authenticated) app.use((request, _response, next) => { request.session = { admin: { id: "1" } }; next(); });
  app.use(router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  try { await callback(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve) => server.close(resolve)); database.query = originalQuery; }
}

test("beş ayrıntılı statik referansı eksiksiz doğrular", async () => {
  const projects = await loadStaticProjects();
  assert.equal(projects.length, 5);
  assert.equal(new Set(projects.map((project) => project.slug)).size, 5);
  assert.ok(projects.every((project) => project.status === "published"));
  assert.ok(projects.every((project) => project.sourceChecksum.length === 64));
});

test("public referans listesi kategori ve sayfalamayı uygular", async () => {
  const calls = [];
  await serverFor(projectsRouter, async (sql, params) => {
    calls.push(params);
    if (sql.includes("COUNT(*)")) return { rows: [{ total: 6 }] };
    return { rows: [row] };
  }, async (base) => {
    const response = await fetch(`${base}?category=web&page=2&limit=5`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.items[0].visual.code, "WEB / 07");
    assert.equal(body.pagination.page, 2);
    assert.deepEqual(calls[1], ["web", "", 5, 5]);
  });
});

test("public referans detayı önceki ve sonraki projeyi döndürür", async () => {
  let call = 0;
  await serverFor(projectsRouter, async () => {
    call += 1;
    if (call === 1) return { rows: [row] };
    return { rows: [{ title: "Önceki", slug: "onceki" }, { title: row.title, slug: row.slug }, { title: "Sonraki", slug: "sonraki" }] };
  }, async (base) => {
    const response = await fetch(`${base}/${row.slug}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.navigation.previous.slug, "onceki");
    assert.equal(body.navigation.next.slug, "sonraki");
  });
});

test("admin referans uçları oturum gerektirir", async () => {
  let queried = false;
  await serverFor(adminProjectsRouter, async () => { queried = true; return { rows: [] }; }, async (base) => {
    const response = await fetch(base);
    assert.equal(response.status, 401);
    assert.equal(queried, false);
  });
});

test("admin yeni referans oluşturabilir", async () => {
  const body = { title: row.title, slug: row.slug, summary: row.summary, category: row.category, status: "draft", imagePath: null,
    seoTitle: row.seo_title, metaDescription: row.meta_description, imageAlt: "", sortOrder: 10, publishedAt: null, content: row.content };
  await serverFor(adminProjectsRouter, async (sql, params) => {
    assert.match(sql, /INSERT INTO projects/);
    assert.equal(params[1], row.slug);
    return { rows: [row] };
  }, async (base) => {
    const response = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).item.slug, row.slug);
  }, true);
});

test("görsel ve SEO alanları olmadan referansı yayınlamaz", async () => {
  let queried = false;
  const body = { title: row.title, slug: row.slug, summary: row.summary, category: row.category, status: "published", imagePath: null,
    seoTitle: row.seo_title, metaDescription: row.meta_description, imageAlt: "", sortOrder: 10, publishedAt: row.published_at, content: row.content };
  await serverFor(adminProjectsRouter, async () => { queried = true; return { rows: [] }; }, async (base) => {
    const response = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, 422);
    assert.equal(queried, false);
  }, true);
});

test("admin güvensiz ilgili hizmet bağlantısını kaydedemez", async () => {
  let queried = false;
  const body = { title: row.title, slug: row.slug, summary: row.summary, category: row.category, status: "draft", imagePath: null,
    seoTitle: row.seo_title, metaDescription: row.meta_description, imageAlt: "", sortOrder: 10, publishedAt: null,
    content: { ...row.content, related: [["Zararlı bağlantı", "javascript:alert(1)"]] } };
  await serverFor(adminProjectsRouter, async () => { queried = true; return { rows: [] }; }, async (base) => {
    const response = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, 422);
    assert.equal(queried, false);
    assert.ok((await response.json()).fields.includes("content.related.0.1"));
  }, true);
});

test("admin referansı sıralayabilir ve geri alınabilir biçimde silebilir", async () => {
  let mode = "order";
  await serverFor(adminProjectsRouter, async (sql, params) => {
    if (mode === "order") { assert.match(sql, /sort_order=\$2/); return { rows: [{ id: 7, sort_order: 30 }] }; }
    assert.match(sql, /deleted_at=NOW\(\)/); return { rows: [{ id: 7 }] };
  }, async (base) => {
    let response = await fetch(`${base}/7/order`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: 30 }) });
    assert.equal(response.status, 200);
    mode = "delete";
    response = await fetch(`${base}/7`, { method: "DELETE" });
    assert.equal(response.status, 200);
  }, true);
});
