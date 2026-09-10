import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { isSafePublicLink } from "./safe-links.js";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const defaultStaticProjectSource = resolve(moduleDirectory, "..", "..", "..", "assets", "site.js");

const routes = Object.freeze({
  web: "/hizmetlerimiz/web-cozumleri",
  software: "/hizmetlerimiz/yazilim-cozumleri",
  network: "/hizmetlerimiz/network-cozumleri",
  system: "/hizmetlerimiz/sistem-cozumleri",
  solutions: "/hizmetlerimiz/teknoloji-danismanligi",
});

const slugs = Object.freeze({
  web: "kurumsal-web-platformu",
  software: "soguk-zincir-istisna-yonetimi",
  network: "ag-standardizasyonu",
  system: "sistem-modernizasyonu",
  consulting: "teknoloji-yol-haritasi",
});

const publicationDates = Object.freeze({
  web: "2026-08-20",
  software: "2026-08-10",
  network: "2026-07-30",
  system: "2026-07-20",
  consulting: "2026-07-10",
});

const allowedCategories = new Set(Object.keys(slugs));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requiredText(value, field, maximumLength = Infinity) {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(`Referans alanı boş olamaz: ${field}`);
  if (normalized.length > maximumLength) throw new Error(`Referans alanı çok uzun: ${field}`);
  return normalized;
}

function textArray(value, field, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum) throw new Error(`Referans alanı geçersiz: ${field}`);
  return value.map((item, index) => requiredText(item, `${field}.${index}`));
}

function tupleArray(value, field, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum) throw new Error(`Referans alanı geçersiz: ${field}`);
  return value.map((item, index) => {
    if (!Array.isArray(item) || item.length !== 2) throw new Error(`Referans ikilisi geçersiz: ${field}.${index}`);
    return [requiredText(item[0], `${field}.${index}.label`), requiredText(item[1], `${field}.${index}.value`)];
  });
}

function relatedLinkArray(value, field, minimum = 1) {
  return tupleArray(value, field, minimum).map(([label, link], index) => {
    if (!isSafePublicLink(link)) throw new Error(`Güvensiz referans bağlantısı: ${field}.${index}.value`);
    return [label, link];
  });
}

function sourceChecksum(project) {
  return createHash("sha256").update(JSON.stringify(project)).digest("hex");
}

function extractCaseStudyObject(source, sourcePath) {
  const startMarker = "const caseStudyData = ";
  const endMarker = "\n};\n\nfunction applyCaseStudyData";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error("Referans veri bloğu assets/site.js içinde bulunamadı.");
  const literal = source.slice(start + startMarker.length, end + 2);
  return vm.runInNewContext(`(${literal})`, { routes }, { filename: sourcePath, timeout: 2_000 });
}

export function validateStaticProjects(rawProjects) {
  const entries = Object.entries(rawProjects || {});
  if (entries.length !== 5) throw new Error(`Beş ayrıntılı referans bekleniyordu; ${entries.length} bulundu.`);

  return entries.map(([category, rawProject], index) => {
    if (!allowedCategories.has(category)) throw new Error(`Geçersiz referans kategorisi: ${category}`);
    const slug = slugs[category];
    if (!slugPattern.test(slug)) throw new Error(`Geçersiz referans slug değeri: ${slug}`);
    const content = {
      client: requiredText(rawProject.client, `${category}.client`, 220),
      industry: requiredText(rawProject.industry, `${category}.industry`, 220),
      services: requiredText(rawProject.services, `${category}.services`, 500),
      reportStatus: requiredText(rawProject.status, `${category}.status`, 120),
      code: requiredText(rawProject.code, `${category}.code`, 40),
      visualLabel: requiredText(rawProject.visualLabel, `${category}.visualLabel`, 160),
      visualCaption: requiredText(rawProject.visualCaption, `${category}.visualCaption`, 300),
      need: textArray(rawProject.need, `${category}.need`, 2),
      approach: textArray(rawProject.approach, `${category}.approach`, 2),
      solution: textArray(rawProject.solution, `${category}.solution`, 2),
      technicalIntro: requiredText(rawProject.technicalIntro, `${category}.technicalIntro`),
      architecture: tupleArray(rawProject.architecture, `${category}.architecture`, 3),
      technicalNote: requiredText(rawProject.technicalNote, `${category}.technicalNote`),
      process: tupleArray(rawProject.process, `${category}.process`, 3),
      outcomeLead: requiredText(rawProject.outcomeLead, `${category}.outcomeLead`),
      outcome: textArray(rawProject.outcome, `${category}.outcome`, 2),
      related: relatedLinkArray(rawProject.related, `${category}.related`, 1),
    };
    const project = {
      title: requiredText(rawProject.title, `${category}.title`, 220),
      slug,
      summary: requiredText(rawProject.summary, `${category}.summary`, 800),
      category,
      status: "published",
      imagePath: requiredText(rawProject.imagePath, `${category}.imagePath`, 2_000),
      sortOrder: (index + 1) * 10,
      content,
      publishedAt: publicationDates[category],
    };
    return Object.freeze({ ...project, sourceChecksum: sourceChecksum(project) });
  });
}

export async function loadStaticProjects(sourcePath = defaultStaticProjectSource) {
  const source = await readFile(sourcePath, "utf8");
  return validateStaticProjects(extractCaseStudyObject(source, sourcePath));
}
