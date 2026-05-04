import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | undefined;

function getMailerConfig() {
  const user =
    process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim() || "";
  const pass =
    process.env.SMTP_PASS?.trim() ||
    process.env.GMAIL_APP_PASSWORD?.trim() ||
    "";
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure =
    (process.env.SMTP_SECURE ?? `${port === 465}`).trim().toLowerCase() ===
    "true";
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "ELimuCore";
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || user;

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER/SMTP_PASS for OTP email delivery.");
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    from: `${fromName} <${fromEmail}>`
  };
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const config = getMailerConfig();
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  return transporter;
}

export async function sendMail(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const config = getMailerConfig();
  const transport = getTransporter();

  await transport.sendMail({
    from: config.from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html
  });
}
