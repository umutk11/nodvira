import { Router, raw } from "express";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { database } from "../db.js";
import { requireAdmin } from "../middleware/admin-auth.js";
import {
  ensureUploadDirectory,
  inspectImage,
  removeStoredImage,
  safeOriginalName,
  storedImageName,
  UploadValidationError,
} from "../services/image-uploads.js";

const unusedCondition = `NOT EXISTS (
  SELECT 1 FROM blog_posts b WHERE b.deleted_at IS NULL AND b.image_path = uploaded_files.public_path
) AND NOT EXISTS (
  SELECT 1 FROM projects p WHERE p.deleted_at IS NULL AND p.image_path = uploaded_files.public_path
)`;

function serialize(row) {
  return {
    id: String(row.id),
    path: row.public_path,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    unused: row.unused === undefined ? undefined : Boolean(row.unused),
  };
}

async function deleteRowsAndFiles(rows) {
  const removed = [];
  for (const row of rows) {
    await removeStoredImage(config.uploads.directory, row.stored_name);
    await database.query("UPDATE uploaded_files SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL", [row.id]);
    removed.push(String(row.id));
  }
  return removed;
}

export const adminUploadsRouter = Router();
adminUploadsRouter.use(requireAdmin);
adminUploadsRouter.use((_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});

adminUploadsRouter.post(
  "/",
  raw({ type: ["image/jpeg", "image/png", "image/webp", "application/octet-stream"], limit: config.uploads.maxBytes }),
  async (request, response) => {
    let storedName;
    try {
      const inspected = inspectImage(request.body, request.get("content-type")?.split(";")[0].trim().toLowerCase());
      storedName = storedImageName(inspected.extension);
      const publicPath = `/uploads/${storedName}`;
      const originalName = safeOriginalName(request.get("x-file-name"));
      await ensureUploadDirectory(config.uploads.directory);
      await writeFile(path.join(config.uploads.directory, storedName), request.body, { flag: "wx", mode: 0o640 });
      try {
        const result = await database.query(
          `INSERT INTO uploaded_files (stored_name, original_name, mime_type, size_bytes, public_path, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, public_path, original_name, mime_type, size_bytes, created_at`,
          [storedName, originalName, inspected.mimeType, request.body.length, publicPath, request.session.admin.id]
        );
        return response.status(201).json({ ok: true, item: serialize(result.rows[0]) });
      } catch (error) {
        await removeStoredImage(config.uploads.directory, storedName);
        throw error;
      }
    } catch (error) {
      if (error instanceof UploadValidationError) {
        return response.status(error.status).json({ error: error.code, message: error.message });
      }
      throw error;
    }
  }
);

adminUploadsRouter.get("/", async (request, response) => {
  const onlyUnused = request.query.status === "unused";
  const result = await database.query(
    `SELECT id, public_path, original_name, mime_type, size_bytes, created_at,
            (${unusedCondition}) AS unused
     FROM uploaded_files
     WHERE deleted_at IS NULL AND ($1::boolean = FALSE OR (${unusedCondition}))
     ORDER BY created_at DESC
     LIMIT 200`,
    [onlyUnused]
  );
  return response.json({ ok: true, items: result.rows.map(serialize) });
});

adminUploadsRouter.delete("/:id", async (request, response) => {
  const result = await database.query(
    `SELECT id, stored_name FROM uploaded_files
     WHERE id = $1 AND deleted_at IS NULL AND (${unusedCondition})`,
    [request.params.id]
  );
  if (!result.rows[0]) {
    return response.status(409).json({ error: "upload_in_use", message: "Kullanılan veya bulunamayan bir görsel silinemez." });
  }
  await deleteRowsAndFiles(result.rows);
  return response.json({ ok: true, message: "Kullanılmayan görsel silindi." });
});

adminUploadsRouter.post("/cleanup", async (_request, response) => {
  const result = await database.query(
    `SELECT id, stored_name FROM uploaded_files
     WHERE deleted_at IS NULL
       AND created_at < NOW() - ($1::integer * INTERVAL '1 hour')
       AND (${unusedCondition})
     ORDER BY id
     LIMIT 200`,
    [config.uploads.unusedGraceHours]
  );
  const removedIds = await deleteRowsAndFiles(result.rows);
  return response.json({ ok: true, removed: removedIds.length, removedIds });
});
