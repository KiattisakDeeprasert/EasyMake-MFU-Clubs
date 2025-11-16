import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM, 
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[MAIL] failed:", error);
      return;
    }

    console.log("[MAIL] sent:", data?.id, "to:", to);
  } catch (err) {
    console.error("[MAIL] exception:", err);
  }
}
