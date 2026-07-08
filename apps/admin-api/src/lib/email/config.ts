export type EmailTemplateKey =
  | "PASSWORD_RESET"
  | "WELCOME_VENDOR"
  | "NEW_ORDER"
  | "PAYMENT_FAILED"
  | "NEW_DISPUTE"
  | "NEW_MESSAGE"
  | "LOW_STOCK"
  | "NEW_REVIEW"
  | "DISPUTE_STATUS_CHANGE";

const TEMPLATE_ENV_KEYS: Record<EmailTemplateKey, string> = {
  PASSWORD_RESET: "BREVO_TEMPLATE_PASSWORD_RESET",
  WELCOME_VENDOR: "BREVO_TEMPLATE_WELCOME_VENDOR",
  NEW_ORDER: "BREVO_TEMPLATE_NEW_ORDER",
  PAYMENT_FAILED: "BREVO_TEMPLATE_PAYMENT_FAILED",
  NEW_DISPUTE: "BREVO_TEMPLATE_NEW_DISPUTE",
  NEW_MESSAGE: "BREVO_TEMPLATE_NEW_MESSAGE",
  LOW_STOCK: "BREVO_TEMPLATE_LOW_STOCK",
  NEW_REVIEW: "BREVO_TEMPLATE_NEW_REVIEW",
  DISPUTE_STATUS_CHANGE: "BREVO_TEMPLATE_DISPUTE_STATUS_CHANGE",
};

export function getEmailConfig() {
  return {
    apiKey: process.env.BREVO_API_KEY ?? "",
    senderEmail: process.env.BREVO_SENDER_EMAIL ?? "",
    senderName: process.env.BREVO_SENDER_NAME ?? "Mercado Oriental",
    adminWebUrl: (process.env.ADMIN_WEB_URL ?? "http://localhost:5173").replace(/\/$/, ""),
  };
}

export function getEmailTemplateId(key: EmailTemplateKey): number | null {
  const raw = process.env[TEMPLATE_ENV_KEYS[key]];
  if (!raw?.trim()) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function isEmailConfigured(): boolean {
  const { apiKey, senderEmail } = getEmailConfig();
  return Boolean(apiKey && senderEmail);
}
