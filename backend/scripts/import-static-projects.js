import { closeDatabase, database } from "../src/db.js";
import { defaultStaticProjectSource, loadStaticProjects } from "../src/services/static-project-source.js";

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");
const importSource = "static-reference";

async function importProject(client, project) {
  const existingResult = await client.query(
    `SELECT import_source, TRIM(import_checksum) AS import_checksum, updated_at, imported_at
     FROM projects WHERE slug = $1 FOR UPDATE`,
    [project.slug]
  );
  const existing = existingResult.rows[0];
  if (existing?.import_checksum === project.sourceChecksum && !force) return "unchanged";
  const protectedFromOverwrite = existing && (
    existing.import_source !== importSource
    || !existing.imported_at
    || new Date(existing.updated_at).getTime() > new Date(existing.imported_at).getTime()
  );
  if (protectedFromOverwrite && !force) return "protected";

  const result = await client.query(
    `INSERT INTO projects
      (title, slug, summary, category, status, image_path, seo_title, meta_description, image_alt,
       sort_order, content, published_at, import_source, import_checksum, imported_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       summary = EXCLUDED.summary,
       category = EXCLUDED.category,
       status = EXCLUDED.status,
       image_path = EXCLUDED.image_path,
       seo_title = EXCLUDED.seo_title,
       meta_description = EXCLUDED.meta_description,
       image_alt = EXCLUDED.image_alt,
       sort_order = EXCLUDED.sort_order,
       content = EXCLUDED.content,
       published_at = EXCLUDED.published_at,
       import_source = EXCLUDED.import_source,
       import_checksum = EXCLUDED.import_checksum,
       imported_at = NOW(),
       deleted_at = NULL
     RETURNING id`,
    [
      project.title, project.slug, project.summary, project.category, project.status,
      project.imagePath, `${project.title} | NODVIRA`.slice(0, 70), project.summary.slice(0, 180),
      project.imagePath ? `${project.title} proje kapak görseli`.slice(0, 300) : null,
      project.sortOrder, JSON.stringify(project.content), project.publishedAt,
      importSource, project.sourceChecksum,
    ]
  );
  if (!result.rows[0]) throw new Error(`Referans aktarılamadı: ${project.slug}`);
  return existing ? "updated" : "inserted";
}

async function run() {
  const projects = await loadStaticProjects();
  console.log(`Referans kaynağı doğrulandı: ${projects.length} proje (${defaultStaticProjectSource})`);
  if (dryRun) {
    projects.forEach((project) => console.log(`OK ${project.sortOrder} ${project.category} ${project.slug}`));
    console.log("Kuru çalışma tamamlandı; PostgreSQL üzerinde değişiklik yapılmadı.");
    return;
  }

  const client = await database.connect();
  const summary = { inserted: 0, updated: 0, unchanged: 0, protected: 0 };
  try {
    await client.query("BEGIN");
    for (const project of projects) {
      const outcome = await importProject(client, project);
      summary[outcome] += 1;
      console.log(`${outcome.toUpperCase()} ${project.slug}`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  console.log(`Referans aktarımı tamamlandı: ${summary.inserted} yeni, ${summary.updated} güncel, ${summary.unchanged} değişmemiş, ${summary.protected} korunmuş.`);
}

try {
  await run();
  process.exitCode = 0;
} catch (error) {
  console.error("Statik referans aktarımı başarısız oldu.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
