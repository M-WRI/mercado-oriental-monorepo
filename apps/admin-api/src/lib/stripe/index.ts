import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    platformFeePercent: Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "0"),
    storeWebUrl: (process.env.STORE_WEB_URL ?? "http://localhost:5174").replace(/\/$/, ""),
    adminWebUrl: (process.env.ADMIN_WEB_URL ?? "http://localhost:5173").replace(/\/$/, ""),
  };
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeConfig().secretKey);
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    const { secretKey } = getStripeConfig();
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

export function eurosToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function computeTransferCents(orderTotal: number, feePercent: number): number {
  const totalCents = eurosToCents(orderTotal);
  const feeCents = Math.round(totalCents * (feePercent / 100));
  return Math.max(totalCents - feeCents, 0);
}
