import { SMTPServer } from "smtp-server";

const messages = [];
const smtpServer = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  onAuth(_auth, _session, callback) {
    callback(null, { user: "nodvira-test" });
  },
  onData(stream, _session, callback) {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      messages.push(Buffer.concat(chunks).toString("utf8"));
      callback(null, "NODVIRA test message accepted");
    });
    stream.on("error", callback);
  },
});

await new Promise((resolve, reject) => {
  smtpServer.once("error", reject);
  smtpServer.listen(2525, "127.0.0.1", resolve);
});

try {
  process.env.MAIL_MODE = "smtp";
  process.env.SMTP_HOST = "127.0.0.1";
  process.env.SMTP_PORT = "2525";
  process.env.SMTP_SECURE = "false";
  process.env.SMTP_USER = "nodvira-test";
  process.env.SMTP_PASSWORD = "nodvira-test";
  process.env.SMTP_FROM = "info@nodvira.com";
  process.env.CONTACT_NOTIFICATION_TO = "info@nodvira.com";

  const { sendContactNotification } = await import("../src/services/mail.js");
  await sendContactNotification({
    id: 999,
    name: "SMTP Uçtan Uca Test",
    company: "NODVIRA",
    email: "test@nodvira.com",
    phone: "+90 555 000 00 00",
    service: "software",
    message: "Bu ileti gerçek SMTP protokolü üzerinden hazırlanmıştır.",
  });

  if (messages.length !== 1) throw new Error("SMTP server did not receive exactly one message.");
  if (!messages[0].includes("SMTP U=C3=A7tan Uca Test")) {
    throw new Error("SMTP message does not contain the expected requester name.");
  }
  if (!messages[0].includes("Yeni ileti=C5=9Fim talebi")) {
    throw new Error("SMTP message does not contain the expected subject.");
  }

  console.log("SMTP notification test passed.");
  process.exitCode = 0;
} catch (error) {
  console.error("SMTP notification test failed.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await new Promise((resolve) => smtpServer.close(resolve));
}
