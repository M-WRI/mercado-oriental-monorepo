import type { Request, Response } from "express";
import { getStripe, getStripeConfig } from "../../../lib/stripe";
import {
  fulfillCheckoutSession,
  expireCheckoutSession,
  cancelCheckoutOrders,
} from "../../../lib/checkout";
import { prisma } from "../../../lib/prisma";

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  const { webhookSecret } = getStripeConfig();

  if (!webhookSecret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(503).send("Webhook secret not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe] webhook signature verification failed:", err);
    return res.status(400).send("Invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { id: string };
        await fulfillCheckoutSession(session.id);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as { id: string };
        await expireCheckoutSession(session.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as { id: string; metadata?: Record<string, string> };
        const checkoutSessionId = intent.metadata?.checkoutSessionId;
        if (checkoutSessionId) {
          await cancelCheckoutOrders(checkoutSessionId, "Payment failed");
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object as {
          id: string;
          details_submitted?: boolean;
          charges_enabled?: boolean;
        };
        if (account.details_submitted && account.charges_enabled) {
          await prisma.shop.updateMany({
            where: { stripeAccountId: account.id },
            data: { stripeOnboardingComplete: true },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe] webhook handler error for ${event.type}:`, err);
    return res.status(500).send("Webhook handler failed");
  }

  return res.json({ received: true });
}
