import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { getStripe, getStripeConfig, isStripeConfigured } from "../../../lib/stripe";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const createStripeConnect = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!isStripeConfigured()) {
    throw new AppError({
      case: "stripe_not_configured",
      code: ERROR_CODES.SERVER_ERROR,
      statusCode: 503,
    });
  }

  const { id: shopId } = req.params;
  const userId = req.user!.userId;

  const shop = await prisma.shop.findFirst({
    where: { id: shopId, userId },
  });

  if (!shop) {
    throw new AppError({ case: "shop", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const stripe = getStripe();
  const { adminWebUrl } = getStripeConfig();

  let accountId = shop.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { shopId: shop.id },
    });
    accountId = account.id;
    await prisma.shop.update({
      where: { id: shop.id },
      data: { stripeAccountId: accountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${adminWebUrl}/s/${shop.id}/settings?stripe=refresh`,
    return_url: `${adminWebUrl}/s/${shop.id}/settings?stripe=return`,
    type: "account_onboarding",
  });

  return res.json({ url: accountLink.url });
});

export const getStripeConnectStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: shopId } = req.params;
  const userId = req.user!.userId;

  const shop = await prisma.shop.findFirst({
    where: { id: shopId, userId },
    select: {
      stripeAccountId: true,
      stripeOnboardingComplete: true,
    },
  });

  if (!shop) {
    throw new AppError({ case: "shop", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  if (!shop.stripeAccountId) {
    return res.json({
      connected: false,
      onboardingComplete: false,
    });
  }

  if (isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(shop.stripeAccountId);
      const onboardingComplete = Boolean(account.details_submitted && account.charges_enabled);

      if (onboardingComplete !== shop.stripeOnboardingComplete) {
        await prisma.shop.update({
          where: { id: shopId },
          data: { stripeOnboardingComplete: onboardingComplete },
        });
      }

      return res.json({
        connected: true,
        onboardingComplete,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
      });
    } catch {
      // fall through to DB state
    }
  }

  return res.json({
    connected: true,
    onboardingComplete: shop.stripeOnboardingComplete,
  });
});
