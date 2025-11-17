import { env } from "./env";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    console.log("[MAIL] Brevo sending", { to, from: env.EMAIL_FROM });

    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: env.EMAIL_FROM,
          name: env.EMAIL_FROM_NAME,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[MAIL] Brevo failed:", res.status, text);
      return;
    }

    console.log("[MAIL] Brevo sent to", to);
  } catch (err) {
    console.error("[MAIL] Brevo exception:", err);
  }
}
