import nodemailer from "nodemailer";
import { config } from "../config.js";

const serviceLabels = Object.freeze({
  web: "Web Çözümleri",
  software: "Yazılım Çözümleri",
  network: "Network Çözümleri",
  system: "Sistem Çözümleri",
  consulting: "Teknoloji Danışmanlığı",
  other: "Diğer",
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createTransport() {
  if (config.mail.mode === "log") {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    family: 4,
    auth: {
      user: config.mail.user,
      pass: config.mail.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

const transporter = createTransport();

export async function sendContactNotification(contactRequest) {
  const service = serviceLabels[contactRequest.service] || contactRequest.service;
  const subject = `Yeni iletişim talebi · ${service} · #${contactRequest.id}`;
  const text = [
    `Talep No: ${contactRequest.id}`,
    `Ad Soyad: ${contactRequest.name}`,
    `Firma: ${contactRequest.company || "Belirtilmedi"}`,
    `E-posta: ${contactRequest.email}`,
    `Telefon: ${contactRequest.phone || "Belirtilmedi"}`,
    `Hizmet: ${service}`,
    "",
    contactRequest.message,
  ].join("\n");

  const html = `
    <h1>Yeni iletişim talebi</h1>
    <p><strong>Talep No:</strong> ${contactRequest.id}</p>
    <p><strong>Ad Soyad:</strong> ${escapeHtml(contactRequest.name)}</p>
    <p><strong>Firma:</strong> ${escapeHtml(contactRequest.company || "Belirtilmedi")}</p>
    <p><strong>E-posta:</strong> ${escapeHtml(contactRequest.email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(contactRequest.phone || "Belirtilmedi")}</p>
    <p><strong>Hizmet:</strong> ${escapeHtml(service)}</p>
    <hr>
    <p>${escapeHtml(contactRequest.message).replaceAll("\n", "<br>")}</p>
  `;

  const result = await transporter.sendMail({
    from: config.mail.from,
    to: config.mail.notificationTo,
    replyTo: contactRequest.email,
    subject,
    text,
    html,
  });

  if (config.mail.mode === "log") {
    console.log(`Development mail prepared for contact request #${contactRequest.id}.`);
  }

  return result;
}
