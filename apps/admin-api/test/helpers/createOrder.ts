export async function seedProductWithVariant(
  shopId: string,
  options?: { productName?: string; variantName?: string; price?: number; stock?: number }
) {
  const { prisma } = await import("../../src/lib/prisma");
  const product = await prisma.product.create({
    data: {
      name: options?.productName ?? "Test Product",
      shopId,
      productVariants: {
        create: [
          {
            name: options?.variantName ?? "Default Variant",
            price: options?.price ?? 19.99,
            stock: options?.stock ?? 50,
          },
        ],
      },
    },
    include: { productVariants: true },
  });
  return { id: product.id, variantId: product.productVariants[0].id };
}

export async function seedOrderViaDb(
  shopId: string,
  variantId: string,
  options?: {
    status?: string;
    customerEmail?: string;
    customerName?: string;
    shippingAddress?: string;
    totalAmount?: number;
    quantity?: number;
    unitPrice?: number;
  }
) {
  const { prisma } = await import("../../src/lib/prisma");
  const { applyInitialOrderInventory } = await import("../../src/lib/inventory");
  const qty = options?.quantity ?? 1;
  const unitPrice = options?.unitPrice ?? 19.99;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerEmail: options?.customerEmail ?? "test-customer@example.com",
        customerName: options?.customerName ?? "Test Customer",
        status: options?.status ?? "pending",
        totalAmount: options?.totalAmount ?? qty * unitPrice,
        shippingAddress: options?.shippingAddress ?? "123 Test St, City, Country",
        shopId,
        orderItems: {
          create: [
            {
              quantity: qty,
              unitPrice,
              productName: "Test Product",
              variantName: "Default Variant",
              productVariantId: variantId,
            },
          ],
        },
      },
      include: { orderItems: true },
    });
    await applyInitialOrderInventory(tx, order.id);
    return order;
  });
}
