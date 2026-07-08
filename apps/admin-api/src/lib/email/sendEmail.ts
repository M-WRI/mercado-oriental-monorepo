import { getEmailConfig, getEmailTemplateId, isEmailConfigured, type EmailTemplateKey } from "./config";

export interface SendTemplateEmailParams {
  to: string;
  template: EmailTemplateKey;
  params: Record<string, string | number>;
  tags?: string[];
}

export async function sendTemplateEmail({
  to,
  template,
  params,
  tags,
}: SendTemplateEmailParams): Promise<void> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[email] Skipping send — set BREVO_API_KEY and BREVO_SENDER_EMAIL");
    }
    return;
  }

  const templateId = getEmailTemplateId(template);
  if (!templateId) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[email] Skipping ${template} — template ID not configured in env`);
    }
    return;
  }

  const { apiKey, senderEmail, senderName } = getEmailConfig();

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      templateId,
      params,
      tags,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}
