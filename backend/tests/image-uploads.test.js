import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { config } from "../src/config.js";
import { adminUploadsRouter } from "../src/routes/admin-uploads.js";
import {
  inspectImage,
  isManagedUploadPath,
  safeOriginalName,
  storedImageName,
  UploadValidationError,
} from "../src/services/image-uploads.js";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const webp = Buffer.from("RIFF1234WEBP", "ascii");

test("görsel türünü dosya imzasından doğrular", () => {
  assert.deepEqual(inspectImage(jpeg, "image/jpeg"), { mimeType: "image/jpeg", extension: ".jpg" });
  assert.deepEqual(inspectImage(png, "image/png"), { mimeType: "image/png", extension: ".png" });
  assert.deepEqual(inspectImage(webp, "image/webp"), { mimeType: "image/webp", extension: ".webp" });
  assert.throws(() => inspectImage(Buffer.from("<svg></svg>"), "image/svg+xml"), UploadValidationError);
  assert.throws(() => inspectImage(png, "image/jpeg"), /eşleşmiyor/);
});

test("dosya adını güvenli hale getirir ve benzersiz saklama adı üretir", () => {
  assert.equal(safeOriginalName(encodeURIComponent("../kapak görseli.png")), "kapak görseli.png");
  const first = storedImageName(".webp");
  const second = storedImageName(".webp");
  assert.notEqual(first, second);
  assert.equal(isManagedUploadPath(`/uploads/${first}`), true);
  assert.equal(isManagedUploadPath("/uploads/../../secret.webp"), false);
});

test("yükleme boyutu sınırını aşan isteği reddeder", async () => {
  const app = express();
  app.use((request, _response, next) => { request.session = { admin: { id: "1" } }; next(); });
  app.use("/uploads", adminUploadsRouter);
  app.use((error, _request, response, _next) => response.status(error.type === "entity.too.large" ? 413 : 500).json({ error: error.type }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/uploads`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: Buffer.alloc(config.uploads.maxBytes + 1, 0xff),
    });
    assert.equal(response.status, 413);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
