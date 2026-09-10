import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { database } from "../db.js";
import { sendContactNotification } from "../services/mail.js";
import { logSafeError, safeErrorSummary } from "../services/safe-error.js";

const serviceAliases = Object.freeze({
  "Web Çözümleri": "web",
  "Yazılım Çözümleri": "software",
  "Network Çözümleri": "network",
  "Sistem Çözümleri": "system",
  "Teknoloji Danışmanlığı": "consulting",
  "KVKK Başvurusu": "privacy",
  Diğer: "other",
});

const contactRequestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().regex(/^\+90 5\d{2} \d{3} \d{2} \d{2}$/).optional(),
  service: z.enum(["web", "software", "network", "system", "consulting", "privacy", "other"]),
  message: z.string().trim().min(10).max(5000),
  privacyNoticeAcknowledged: z.literal(true),
  sourceUrl: z.string().trim().max(2000).optional(),
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      error: "rate_limited",
      message: "Kısa süre içinde çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin.",
    });
  },
});

function optionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

export function normalizeTurkishMobilePhone(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return undefined;
  if (!/^\+?[0-9 ]+$/.test(rawValue)) return null;

  const compactValue = rawValue.replaceAll(" ", "");
  const match = compactValue.match(/^(?:\+90|0)?(5\d{9})$/);
  if (!match) return null;

  const nationalNumber = match[1];
  return `+90 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 8)} ${nationalNumber.slice(8, 10)}`;
}

function normalizeRequest(body) {
  const rawService = String(body.service ?? "").trim();
  return {
    name: String(body.name ?? ""),
    company: optionalText(body.company),
    email: String(body.email ?? ""),
    phone: normalizeTurkishMobilePhone(body.phone),
    service: serviceAliases[rawService] || rawService,
    message: String(body.message ?? ""),
    privacyNoticeAcknowledged:
      body.privacyNoticeAcknowledged === true ||
      body.privacyNoticeAcknowledged === "true" ||
      body.privacyNoticeAcknowledged === "on",
    sourceUrl: optionalText(body.sourceUrl),
  };
}

export const contactRequestsRouter = Router();

contactRequestsRouter.post("/", limiter, async (request, response) => {
  if (String(request.body.website ?? "").trim()) {
    return response.status(202).json({
      ok: true,
      message: "Talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.",
    });
  }

  const parsed = contactRequestSchema.safeParse(normalizeRequest(request.body));
  if (!parsed.success) {
    return response.status(422).json({
      error: "validation_failed",
      message: "Lütfen zorunlu alanları kontrol ederek tekrar deneyin.",
      fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
  }

  const values = parsed.data;
  const result = await database.query(
    `INSERT INTO contact_requests
      (name, company, email, phone, service, message, privacy_notice_acknowledged, source_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, company, email, phone, service, message, created_at`,
    [
      values.name,
      values.company || null,
      values.email,
      values.phone || null,
      values.service,
      values.message,
      values.privacyNoticeAcknowledged,
      values.sourceUrl || null,
    ]
  );

  const contactRequest = result.rows[0];
  try {
    await sendContactNotification(contactRequest);
    await database.query(
      `UPDATE contact_requests
       SET notification_status = 'sent', notification_sent_at = NOW(), notification_error = NULL
       WHERE id = $1`,
      [contactRequest.id]
    );
  } catch (error) {
    logSafeError("Contact notification failed.", error, { requestId: Number(contactRequest.id) });
    await database.query(
      `UPDATE contact_requests
       SET notification_status = 'failed', notification_error = $2
       WHERE id = $1`,
      [contactRequest.id, safeErrorSummary(error)]
    );
  }

  return response.status(201).json({
    ok: true,
    requestId: contactRequest.id,
    message: "Talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.",
  });
});
