import { closeDatabase, database } from "../src/db.js";
import { defaultStaticBlogSource, loadStaticBlogPosts } from "../src/services/static-blog-source.js";

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");
const importSource = "static-seed";

async function importPost(client, post) {
  const existingResult = await client.query(
    `SELECT import_source, TRIM(import_checksum) AS import_checksum, updated_at, imported_at
     FROM blog_posts
     WHERE slug = $1
     FOR UPDATE`,
    [post.slug]
  );
  const existing = existingResult.rows[0];

  if (existing?.import_checksum === post.sourceChecksum && !force) return "unchanged";
  const protectedFromOverwrite = existing
    && (
      existing.import_source !== importSource
      || !existing.imported_at
      || new Date(existing.updated_at).getTime() > new Date(existing.imported_at).getTime()
    );
  if (protectedFromOverwrite && !force) return "protected";

  const result = await client.query(
    `INSERT INTO blog_posts
      (title, slug, excerpt, content, category, status, image_path, seo_title, meta_description,
       image_alt, author_name, published_at, import_source, import_checksum, imported_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       excerpt = EXCLUDED.excerpt,
       content = EXCLUDED.content,
       category = EXCLUDED.category,
       status = EXCLUDED.status,
       image_path = EXCLUDED.image_path,
       seo_title = EXCLUDED.seo_title,
       meta_description = EXCLUDED.meta_description,
       image_alt = EXCLUDED.image_alt,
       author_name = EXCLUDED.author_name,
       published_at = EXCLUDED.published_at,
       import_source = EXCLUDED.import_source,
       import_checksum = EXCLUDED.import_checksum,
       imported_at = NOW(),
       deleted_at = NULL
     RETURNING id`,
    [
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.category,
      post.status,
      post.imagePath,
      `${post.title} | NODVIRA`.slice(0, 70),
      post.excerpt.slice(0, 180),
      `${post.title} kapak görseli`.slice(0, 300),
      "NODVIRA",
      post.publishedAt,
      importSource,
      post.sourceChecksum,
    ]
  );

  if (!result.rows[0]) throw new Error(`Blog yazısı aktarılamadı: ${post.slug}`);
  return existing ? "updated" : "inserted";
}

async function run() {
  const posts = await loadStaticBlogPosts();
  console.log(`Statik kaynak doğrulandı: ${posts.length} yazı (${defaultStaticBlogSource})`);

  if (dryRun) {
    for (const post of posts) console.log(`OK ${post.publishedAt || "taslak"} ${post.category} ${post.slug}`);
    console.log("Kuru çalışma tamamlandı; PostgreSQL üzerinde değişiklik yapılmadı.");
    return;
  }

  const client = await database.connect();
  const summary = { inserted: 0, updated: 0, unchanged: 0, protected: 0 };
  try {
    await client.query("BEGIN");
    for (const post of posts) {
      const outcome = await importPost(client, post);
      summary[outcome] += 1;
      console.log(`${outcome.toUpperCase()} ${post.slug}`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  console.log(
    `Blog aktarımı tamamlandı: ${summary.inserted} yeni, ${summary.updated} güncel, `
    + `${summary.unchanged} değişmemiş, ${summary.protected} korunmuş.`
  );
  if (summary.protected) {
    console.log("Korunan kayıtlar yönetici düzenlemesi içeriyor olabilir; bilinçli üzerine yazma için --force kullanın.");
  }
}

try {
  await run();
  process.exitCode = 0;
} catch (error) {
  console.error("Statik blog aktarımı başarısız oldu.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
