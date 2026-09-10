import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";

const imageTypes = Object.freeze({
  "image/jpeg": Object.freeze({ extension: ".jpg", matches: (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff }),
  "image/png": Object.freeze({ extension: ".png", matches: (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }),
  "image/webp": Object.freeze({ extension: ".webp", matches: (data) => data.length >= 12 && data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP" }),
});

export class UploadValidationError extends Error {
  constructor(code, message, status = 422) {
    super(message);
    this.name = "UploadValidationError";
    this.code = code;
    this.status = status;
  }
}

export function inspectImage(data, declaredMimeType) {
  if (!Buffer.isBuffer(data) || data.length === 0) {
    throw new UploadValidationError("empty_file", "Boş bir dosya yüklenemez.");
  }
  const detected = Object.entries(imageTypes).find(([, definition]) => definition.matches(data));
  if (!detected) {
    throw new UploadValidationError("unsupported_file_type", "Yalnızca JPEG, PNG veya WebP görseller yüklenebilir.");
  }
  const [mimeType, definition] = detected;
  if (declaredMimeType && declaredMimeType !== "application/octet-stream" && declaredMimeType !== mimeType) {
    throw new UploadValidationError("file_type_mismatch", "Dosyanın bildirilen türü ile gerçek içeriği eşleşmiyor.");
  }
  return { mimeType, extension: definition.extension };
}

export function safeOriginalName(value) {
  let decoded = String(value || "gorsel");
  try { decoded = decodeURIComponent(decoded); } catch {}
  const baseName = path.basename(decoded).replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (baseName || "gorsel").slice(0, 255);
}

export function storedImageName(extension) {
  return `${randomUUID()}${extension}`;
}

export async function ensureUploadDirectory(directory) {
  await mkdir(directory, { recursive: true });
}

export async function removeStoredImage(directory, storedName) {
  const resolvedDirectory = path.resolve(directory);
  const target = path.resolve(resolvedDirectory, storedName);
  if (path.dirname(target) !== resolvedDirectory) throw new Error("Upload path escaped its configured directory.");
  try {
    await unlink(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export function isManagedUploadPath(value) {
  return /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i.test(String(value || ""));
}
