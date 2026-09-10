import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import net from "node:net";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPreviewServer, isAllowedPreviewPath } from "../../scripts/preview-server.mjs";
import { isSafePublicLink } from "../src/services/safe-links.js";
import { logSafeError, safeErrorSummary } from "../src/services/safe-error.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDirectory, "..", "..");

async function withPreviewServer(callback) {
  const server = createPreviewServer();
  server.listen(0, "127.0.0.1");
  await new Promise((resolveListening, reject) => {
    server.once("listening", resolveListening);
    server.once("error", reject);
  });
  try {
    await callback(server.address().port);
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

function rawRequest(port, target) {
  return new Promise((resolveResponse, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port }, () => {
      socket.end(`GET ${target} HTTP/1.1\r\nHost: preview.local\r\nConnection: close\r\n\r\n`);
    });
    let response = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => { response += chunk; });
    socket.on("end", () => resolveResponse(response));
    socket.on("error", reject);
  });
}

test("güvenli hata kaydı kişisel veri ve PostgreSQL satır ayrıntısını yazmaz", () => {
  const error = new Error("security-probe@example.com Failing row contains personal data");
  error.code = "23514";
  error.constraint = "contact_requests_service_valid";
  error.detail = "Failing row contains security-probe@example.com";
  const calls = [];
  const originalError = console.error;
  console.error = (...arguments_) => calls.push(arguments_);
  try {
    logSafeError("Controlled error.", error, { requestId: 42 });
  } finally {
    console.error = originalError;
  }
  const output = JSON.stringify(calls);
  assert.doesNotMatch(output, /security-probe|Failing row|personal data/i);
  assert.match(output, /23514/);
  assert.match(output, /contact_requests_service_valid/);
  assert.equal(safeErrorSummary(error), "Error (23514)");
});

test("halka açık bağlantılar yalnızca site içi yol veya HTTPS olabilir", () => {
  for (const value of ["/hizmetlerimiz/web-cozumleri", "/iletisim?service=web", "https://example.com/page"]) {
    assert.equal(isSafePublicLink(value), true);
  }
  for (const value of ["javascript:alert(1)", "data:text/html,test", "http://example.com", "//example.com", "/\\example.com", "relative/path"]) {
    assert.equal(isSafePublicLink(value), false);
  }
});

test("admin giriş sayfası demo hesap veya doldurulmuş parola içermez", async () => {
  const source = await readFile(resolve(projectRoot, "admin", "index.html"), "utf8");
  assert.doesNotMatch(source, /demo1234|demo@nodvira\.com|Demo hesap/);
  assert.doesNotMatch(source, /name="password"[^>]*\svalue=/i);
  assert.match(source, /name="username"/);
  assert.doesNotMatch(source, /name="email"/);
});

test("önizleme sunucusu yalnızca açıkça izin verilen statik dosyaları sunar", async () => {
  assert.equal(isAllowedPreviewPath("assets/styles.css"), true);
  assert.equal(isAllowedPreviewPath("admin/assets/login.js"), true);
  assert.equal(isAllowedPreviewPath("backend/.env"), false);
  assert.equal(isAllowedPreviewPath(".git/config"), false);
  assert.equal(isAllowedPreviewPath("assets/../backend/.env"), false);

  await withPreviewServer(async (port) => {
    let response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    response = await fetch(`http://127.0.0.1:${port}/backend/.env`);
    assert.equal(response.status, 404);
    response = await fetch(`http://127.0.0.1:${port}/.git/config`);
    assert.equal(response.status, 404);
    const malformedResponse = await rawRequest(port, "/%");
    assert.match(malformedResponse, /^HTTP\/1\.1 400/);
    response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
  });
});
