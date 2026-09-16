import { createReadStream, existsSync, realpathSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, normalize, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const canonicalRoot = realpathSync(root);
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const cleanRoutes = new Map([
  ["/", "index.html"],
  ["/hizmetlerimiz", "hizmetler.html"],
  ["/hizmetlerimiz/web-cozumleri", "web-tasarim.html"],
  ["/hizmetlerimiz/yazilim-cozumleri", "yazilim-cozumleri.html"],
  ["/hizmetlerimiz/network-cozumleri", "network.html"],
  ["/hizmetlerimiz/sistem-cozumleri", "sistem-cozumleri.html"],
  ["/hizmetlerimiz/teknoloji-danismanligi", "cozumler.html"],
  ["/referanslarimiz", "projeler.html"],
  ["/hakkimizda", "hakkimda.html"],
  ["/blog", "blog.html"],
  ["/sss", "sss.html"],
  ["/iletisim", "iletisim.html"],
  ["/kvkk-aydinlatma-metni", "kvkk-aydinlatma-metni.html"],
  ["/gizlilik-politikasi", "gizlilik-politikasi.html"],
  ["/cerez-politikasi", "cerez-politikasi.html"]
]);

const legacyRoutes = new Map([
  ["/index.html", "/"],
  ["/hizmetler.html", "/hizmetlerimiz"],
  ["/web-tasarim.html", "/hizmetlerimiz/web-cozumleri"],
  ["/yazilim-cozumleri.html", "/hizmetlerimiz/yazilim-cozumleri"],
  ["/network.html", "/hizmetlerimiz/network-cozumleri"],
  ["/sistem-cozumleri.html", "/hizmetlerimiz/sistem-cozumleri"],
  ["/cozumler.html", "/hizmetlerimiz/teknoloji-danismanligi"],
  ["/projeler.html", "/referanslarimiz"],
  ["/hakkimda.html", "/hakkimizda"],
  ["/blog.html", "/blog"],
  ["/sss.html", "/sss"],
  ["/iletisim.html", "/iletisim"],
  ["/kvkk-aydinlatma-metni.html", "/kvkk-aydinlatma-metni"],
  ["/gizlilik-politikasi.html", "/gizlilik-politikasi"],
  ["/cerez-politikasi.html", "/cerez-politikasi"]
]);

const caseSlugs = new Map([
  ["web", "kurumsal-web-platformu"],
  ["software", "soguk-zincir-istisna-yonetimi"],
  ["network", "ag-standardizasyonu"],
  ["system", "sistem-modernizasyonu"],
  ["consulting", "teknoloji-yol-haritasi"]
]);
const validCaseSlugs = new Set(caseSlugs.values());

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

const allowedFiles = new Set([
  ...cleanRoutes.values(),
  "blog-detay.html",
  "referans-detay.html",
  "favicon.ico",
  "admin/index.html",
  "admin/panel.html"
]);

function normalizedPublicPath(relativePath) {
  return normalize(String(relativePath || "")).replaceAll("\\", "/").replace(/^\/+/, "");
}

export function isAllowedPreviewPath(relativePath) {
  const publicPath = normalizedPublicPath(relativePath);
  if (!publicPath || publicPath.startsWith("../") || publicPath.includes("/../")) return false;
  if (!contentTypes[extname(publicPath).toLowerCase()]) return false;
  return allowedFiles.has(publicPath) || publicPath.startsWith("assets/") || publicPath.startsWith("admin/assets/");
}

function isInsideRoot(filePath) {
  const pathFromRoot = relative(canonicalRoot, filePath);
  return pathFromRoot !== "" && !pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot);
}

function notFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  response.end("Sayfa bulunamadı.");
}

function redirect(response, location) {
  response.writeHead(301, { Location: location, "Cache-Control": "no-store" });
  response.end();
}

function sendFile(request, response, relativePath, statusCode = 200) {
  const publicPath = normalizedPublicPath(relativePath);
  if (!isAllowedPreviewPath(publicPath)) return notFound(response);

  const candidate = resolve(canonicalRoot, publicPath);
  if (!isInsideRoot(candidate) || !existsSync(candidate)) return notFound(response);

  let filePath;
  try {
    filePath = realpathSync(candidate);
    if (!isInsideRoot(filePath) || !statSync(filePath).isFile()) return notFound(response);
  } catch {
    return notFound(response);
  }

  response.writeHead(statusCode, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  });
  if (request.method === "HEAD") response.end();
  else {
    const stream = createReadStream(filePath);
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  }
}

function handleRequest(request, response) {
  if (!["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let url;
  let pathname;
  try {
    url = new URL(request.url || "/", "http://preview.local");
    pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("Geçersiz istek adresi.");
    return;
  }

  if (pathname === "/blog-detay.html") {
    const slug = url.searchParams.get("slug");
    redirect(response, slug ? `/blog/${encodeURIComponent(slug)}` : "/blog");
    return;
  }
  if (pathname === "/referans-detay.html") {
    const slug = caseSlugs.get(url.searchParams.get("project"));
    redirect(response, slug ? `/referanslarimiz/${slug}` : "/referanslarimiz");
    return;
  }
  if (legacyRoutes.has(pathname)) {
    const destination = new URL(legacyRoutes.get(pathname), url);
    destination.search = url.search;
    redirect(response, `${destination.pathname}${destination.search}`);
    return;
  }

  let fileName = cleanRoutes.get(pathname);
  if (/^\/blog\/[^/]+$/.test(pathname)) fileName = "blog-detay.html";
  const caseRoute = pathname.match(/^\/referanslarimiz\/([^/]+)$/);
  if (caseRoute) {
    if (!validCaseSlugs.has(caseRoute[1])) {
      sendFile(request, response, "referans-detay.html", 404);
      return;
    }
    fileName = "referans-detay.html";
  }
  if (fileName) {
    sendFile(request, response, fileName);
    return;
  }

  sendFile(request, response, pathname.slice(1));
}

export function createPreviewServer() {
  return createServer(handleRequest);
}

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isEntryPoint) {
  createPreviewServer().listen(port, host, () => {
    console.log(`NODVIRA önizleme: http://${host}:${port}`);
  });
}
