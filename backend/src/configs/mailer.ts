import nodemailer from "nodemailer";
import { env } from "./env";

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export function sendEmail(to: string, subject: string, html: string) {
  mailer
    .sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    .then(() => {
      console.log("[MAIL] sent to", to, subject);
    })
    .catch((err) => {
      console.error("[MAIL] failed:", err);
    });
}
