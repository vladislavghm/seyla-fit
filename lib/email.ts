import nodemailer from "nodemailer";

// Для Gmail достаточно SMTP_USER + SMTP_PASS (+ EMAIL_TO) — host/port подставятся автоматически
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter =
  process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

export type TrialLead = { fullName: string; phone: string };

export async function sendTrialLeadEmail(data: TrialLead): Promise<void> {
  if (!transporter) {
    throw new Error(
      "Почта не настроена: задайте SMTP_USER и SMTP_PASS в .env (для Gmail — достаточно этого и EMAIL_TO)"
    );
  }
  const to = process.env.EMAIL_TO;
  if (!to) {
    throw new Error("EMAIL_TO не задан в .env");
  }
  const from =
    process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@localhost";

  await transporter.sendMail({
    from: `"Seyla Fit" <${from}>`,
    to,
    subject: "Новая заявка на пробное занятие",
    text: `ФИО: ${data.fullName}\nТелефон: ${data.phone}`,
    html: `
      <h2>Новая заявка на пробное занятие</h2>
      <p><strong>ФИО:</strong> ${escapeHtml(data.fullName)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(data.phone)}</p>
      <hr />
      <p style="color:#888;font-size:12px;">Сайт Seyla Fit, форма записи</p>
    `,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
