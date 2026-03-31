import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { applyInitialOrderInventory, syncLowStockNotificationsForVariants } from "../src/lib/inventory";
import { recordMovement } from "../src/lib/inventory";
import { INV_REASON } from "../src/lib/inventory";
import {
  notifyNewOrder,
  notifyPaymentFailed,
  notifyNewMessage,
  notifyNewDispute,
  notifyDisputeStatusChange,
  notifyNewReview,
} from "../src/lib/notifications";

config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.reviewReply.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.disputeMessage.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.orderMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariantAttributeValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "moritz@mercado-oriental.com",
      password: hashedPassword,
      name: "Moritz",
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create shop with a default low-stock threshold
  const shop = await prisma.shop.create({
    data: {
      name: "Moritz's Oriental Market",
      description: "Fresh produce and specialty items from the Orient",
      userId: user.id,
      defaultLowStockThreshold: 8,
    },
  });

  console.log(`Created shop: ${shop.name} (low-stock threshold: ${shop.defaultLowStockThreshold})`);

  // Create attributes
  const sizeAttribute = await prisma.productAttribute.create({
    data: {
      name: "Size",
      description: "Product size options",
      shopId: shop.id,
      productAttributeValues: {
        create: [
          { value: "Small" },
          { value: "Medium" },
          { value: "Large" },
        ],
      },
    },
    include: { productAttributeValues: true },
  });

  const colorAttribute = await prisma.productAttribute.create({
    data: {
      name: "Color",
      description: "Product color options",
      shopId: shop.id,
      productAttributeValues: {
        create: [
          { value: "Red" },
          { value: "Green" },
          { value: "Blue" },
        ],
      },
    },
    include: { productAttributeValues: true },
  });

  console.log(`Created attributes: ${sizeAttribute.name}, ${colorAttribute.name}`);

  const sizeVal = (name: string) => sizeAttribute.productAttributeValues.find((v) => v.value === name)!;
  const colorVal = (name: string) => colorAttribute.productAttributeValues.find((v) => v.value === name)!;

  // All variants start with plenty of stock so orders can be created.
  // We'll drain specific variants AFTER orders to trigger low-stock alerts.
  const teaSet = await prisma.product.create({
    data: {
      name: "Ceramic Tea Set",
      description: "Handcrafted ceramic tea set with traditional patterns",
      shopId: shop.id,
      productVariants: {
        create: [
          {
            name: "Small Red Tea Set",
            price: 29.99,
            stock: 120,
            lowStockThreshold: 10,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Small").id },
                { productAttributeValueId: colorVal("Red").id },
              ],
            },
          },
          {
            name: "Medium Blue Tea Set",
            price: 49.99,
            stock: 100,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Medium").id },
                { productAttributeValueId: colorVal("Blue").id },
              ],
            },
          },
          {
            name: "Large Green Tea Set",
            price: 69.99,
            stock: 90,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Large").id },
                { productAttributeValueId: colorVal("Green").id },
              ],
            },
          },
        ],
      },
    },
    include: { productVariants: true },
  });

  const silkScarf = await prisma.product.create({
    data: {
      name: "Silk Scarf",
      description: "Premium silk scarf with hand-painted designs",
      shopId: shop.id,
      productVariants: {
        create: [
          {
            name: "Large Red Silk Scarf",
            price: 39.99,
            stock: 110,
            lowStockThreshold: 5,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Large").id },
                { productAttributeValueId: colorVal("Red").id },
              ],
            },
          },
          {
            name: "Medium Blue Silk Scarf",
            price: 34.99,
            stock: 95,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Medium").id },
                { productAttributeValueId: colorVal("Blue").id },
              ],
            },
          },
        ],
      },
    },
    include: { productVariants: true },
  });

  const spiceBox = await prisma.product.create({
    data: {
      name: "Spice Gift Box",
      description: "Curated selection of exotic spices in a wooden box",
      shopId: shop.id,
      productVariants: {
        create: [
          {
            name: "Small Spice Box",
            price: 19.99,
            stock: 130,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Small").id },
              ],
            },
          },
          {
            name: "Large Spice Box",
            price: 34.99,
            stock: 100,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal("Large").id },
              ],
            },
          },
        ],
      },
    },
    include: { productVariants: true },
  });

  console.log(`Created products: ${teaSet.name}, ${silkScarf.name}, ${spiceBox.name}`);

  // Create sample orders
  const allVariants = [
    ...teaSet.productVariants,
    ...silkScarf.productVariants,
    ...spiceBox.productVariants,
  ];

  const customerPool = [
    { email: "maria.rossi@gmail.com", name: "Maria Rossi", address: "Via Roma 42, 20121 Milano, Italy", phone: "+39 02 1234567" },
    { email: "luca.bianchi@outlook.com", name: "Luca Bianchi", address: "Corso Buenos Aires 15, 20124 Milano, Italy", phone: "+39 02 7654321" },
    { email: "anna.mueller@web.de", name: "Anna Müller", address: "Hauptstraße 7, 10117 Berlin, Germany", phone: "+49 30 1234567" },
    { email: "jean.dupont@yahoo.fr", name: "Jean Dupont", address: "12 Rue de Rivoli, 75001 Paris, France", phone: "+33 1 23456789" },
    { email: "sofia.garcia@hotmail.com", name: "Sofia Garcia", address: "Calle Mayor 28, 28013 Madrid, Spain", phone: null },
    { email: "marco.conti@gmail.com", name: "Marco Conti", address: "Piazza Navona 3, 00186 Roma, Italy", phone: "+39 06 9876543" },
    { email: "elena.popova@mail.ru", name: "Elena Popova", address: "Nevsky Prospekt 20, St Petersburg, Russia", phone: null },
  ];

  // Create customer accounts (all use "customer123" as password)
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customerMap = new Map<string, string>();

  for (const c of customerPool) {
    const customer = await prisma.customer.create({
      data: {
        email: c.email,
        password: customerPassword,
        name: c.name,
        phone: c.phone,
      },
    });
    customerMap.set(c.email, customer.id);
  }

  console.log(`Created ${customerPool.length} customer accounts`);

  const carriers = ["DHL", "FedEx", "UPS", "Correos", "Hermes", "GLS"];
  const customerNotes = [
    null,
    "Please leave at the door",
    "Gift wrapping please",
    null,
    "Fragile - handle with care",
    null,
    "Call before delivery",
  ];

  const startDate = new Date("2026-01-01");
  const endDate = new Date("2026-03-27");

  for (let i = 0; i < 30; i++) {
    const customer = customerPool[Math.floor(Math.random() * customerPool.length)];
    const orderDate = randomDate(startDate, endDate);

    const itemCount = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...allVariants].sort(() => Math.random() - 0.5);
    const selectedVariants = shuffled.slice(0, itemCount);

    const items = selectedVariants.map((v) => {
      const qty = Math.floor(Math.random() * 2) + 1;
      return {
        quantity: qty,
        unitPrice: v.price,
        productName: "",
        variantName: v.name,
        productVariantId: v.id,
      };
    });

    const total = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);

    const roll = Math.random();
    let status: string;
    if (roll < 0.10) status = "pending";
    else if (roll < 0.18) status = "confirmed";
    else if (roll < 0.25) status = "packed";
    else if (roll < 0.40) status = "shipped";
    else if (roll < 0.90) status = "delivered";
    else status = "cancelled";

    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const tracking = `${carrier.substring(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase()}${i.toString().padStart(3, "0")}`;

    const addHours = (base: Date, h: number) => new Date(base.getTime() + h * 3600_000);

    const confirmedAt = ["confirmed", "packed", "shipped", "delivered"].includes(status) ? addHours(orderDate, 2 + Math.random() * 12) : null;
    const packedAt = ["packed", "shipped", "delivered"].includes(status) ? addHours(confirmedAt!, 4 + Math.random() * 24) : null;
    const shippedAt = ["shipped", "delivered"].includes(status) ? addHours(packedAt!, 1 + Math.random() * 6) : null;
    const deliveredAt = status === "delivered" ? addHours(shippedAt!, 24 + Math.random() * 72) : null;
    const cancelledAt = status === "cancelled" ? addHours(orderDate, 1 + Math.random() * 8) : null;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerEmail: customer.email,
          customerName: customer.name,
          customerId: customerMap.get(customer.email),
          status,
          totalAmount: total,
          shopId: shop.id,
          shippingAddress: customer.address,
          trackingNumber: ["shipped", "delivered"].includes(status) ? tracking : null,
          carrier: ["shipped", "delivered"].includes(status) ? carrier : null,
          customerNote: customerNotes[Math.floor(Math.random() * customerNotes.length)],
          cancelReason: status === "cancelled" ? "Customer requested cancellation" : null,
          confirmedAt,
          packedAt,
          shippedAt,
          deliveredAt,
          cancelledAt,
          createdAt: orderDate,
          orderItems: {
            create: items,
          },
        },
      });
      await applyInitialOrderInventory(tx, order.id);
    });
  }

  console.log("Created 30 sample orders with inventory movements");

  // -------------------------------------------------------------------
  // Post-order adjustments: drain specific variants to trigger alerts.
  // This simulates real scenarios: damage, supplier correction, etc.
  // -------------------------------------------------------------------

  const smallRedTea = teaSet.productVariants.find((v) => v.name.includes("Small Red"))!;
  const largeRedScarf = silkScarf.productVariants.find((v) => v.name.includes("Large Red"))!;
  const smallSpice = spiceBox.productVariants.find((v) => v.name.includes("Small"))!;
  const largeGreenTea = teaSet.productVariants.find((v) => v.name.includes("Large Green"))!;
  const mediumBlueScarf = silkScarf.productVariants.find((v) => v.name.includes("Medium"))!;
  const largeSpice = spiceBox.productVariants.find((v) => v.name.includes("Large"))!;

  // Read current stock levels after orders
  const currentSmallRedTea = await prisma.productVariant.findUnique({ where: { id: smallRedTea.id }, select: { stock: true, reservedStock: true } });
  const currentLargeRedScarf = await prisma.productVariant.findUnique({ where: { id: largeRedScarf.id }, select: { stock: true, reservedStock: true } });
  const currentSmallSpice = await prisma.productVariant.findUnique({ where: { id: smallSpice.id }, select: { stock: true, reservedStock: true } });

  // Drain Small Red Tea Set down to 4 available (low stock, threshold=10)
  if (currentSmallRedTea) {
    const avail = currentSmallRedTea.stock - currentSmallRedTea.reservedStock;
    const drain = Math.max(0, avail - 4);
    if (drain > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.productVariant.update({ where: { id: smallRedTea.id }, data: { stock: { decrement: drain } } });
        await recordMovement(tx, {
          productVariantId: smallRedTea.id,
          stockDelta: -drain,
          reservedDelta: 0,
          reason: INV_REASON.DAMAGE,
          note: `Warehouse inspection: ${drain} cracked/damaged sets removed from stock`,
        });
      });
      console.log(`Drained ${smallRedTea.name}: -${drain} (damage), now ~4 available (threshold 10)`);
    }
  }

  // Drain Large Red Silk Scarf down to 3 available (low stock, threshold=5)
  if (currentLargeRedScarf) {
    const avail = currentLargeRedScarf.stock - currentLargeRedScarf.reservedStock;
    const drain = Math.max(0, avail - 3);
    if (drain > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.productVariant.update({ where: { id: largeRedScarf.id }, data: { stock: { decrement: drain } } });
        await recordMovement(tx, {
          productVariantId: largeRedScarf.id,
          stockDelta: -drain,
          reservedDelta: 0,
          reason: INV_REASON.ADJUSTMENT,
          note: `Physical count correction — found ${drain} fewer than system showed`,
        });
      });
      console.log(`Drained ${largeRedScarf.name}: -${drain} (count correction), now ~3 available (threshold 5)`);
    }
  }

  // Drain Small Spice Box to 0 (out of stock, uses shop default threshold=8)
  if (currentSmallSpice) {
    const toRemove = currentSmallSpice.stock - currentSmallSpice.reservedStock;
    if (toRemove > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.productVariant.update({ where: { id: smallSpice.id }, data: { stock: { decrement: toRemove } } });
        await recordMovement(tx, {
          productVariantId: smallSpice.id,
          stockDelta: -toRemove,
          reservedDelta: 0,
          reason: INV_REASON.ADJUSTMENT,
          note: "Discontinued batch — all remaining units pulled from shelves",
        });
      });
      console.log(`Drained ${smallSpice.name}: -${toRemove} (discontinued), now 0 available`);
    }
  }

  // Record a supplier shipment for the scarf (positive movement)
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({ where: { id: mediumBlueScarf.id }, data: { stock: { increment: 25 } } });
    await recordMovement(tx, {
      productVariantId: mediumBlueScarf.id,
      stockDelta: 25,
      reservedDelta: 0,
      reason: INV_REASON.BULK_ADJUST,
      note: "Shipment received from supplier (PO-2026-034)",
    });
  });
  console.log(`Received stock: ${mediumBlueScarf.name} +25 units`);

  // Record a stock correction on Large Spice Box
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({ where: { id: largeSpice.id }, data: { stock: { decrement: 5 } } });
    await recordMovement(tx, {
      productVariantId: largeSpice.id,
      stockDelta: -5,
      reservedDelta: 0,
      reason: INV_REASON.ADJUSTMENT,
      note: "Warehouse count correction — 5 fewer than system showed",
    });
  });
  console.log(`Recorded adjustment: ${largeSpice.name} -5 units`);

  // Record damage on the Large Green Tea Set
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({ where: { id: largeGreenTea.id }, data: { stock: { decrement: 2 } } });
    await recordMovement(tx, {
      productVariantId: largeGreenTea.id,
      stockDelta: -2,
      reservedDelta: 0,
      reason: INV_REASON.DAMAGE,
      note: "2 sets arrived with chipped lids — marked as damaged",
    });
  });
  console.log(`Recorded damage: ${largeGreenTea.name} -2 units`);

  // -------------------------------------------------------------------
  // Sync low-stock notifications (auto-generated from thresholds)
  // -------------------------------------------------------------------
  await syncLowStockNotificationsForVariants(allVariants.map((v) => v.id));

  // Sample in-app notifications: new orders + failed payment (PSP not wired yet — demo only)
  const latestOrders = await prisma.order.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 2,
  });
  for (const o of latestOrders) {
    await notifyNewOrder(o.id);
  }
  await notifyPaymentFailed({
    shopId: shop.id,
    orderId: latestOrders[0]?.id ?? null,
    amount: 49.99,
    reason: "Card declined (demo — wire notifyPaymentFailed from your payment webhook)",
    providerReference: "seed-payment-failed-001",
  });

  const notifCount = await prisma.notification.count();
  const movementCount = await prisma.inventoryMovement.count();
  console.log(`\nSynced notifications: ${notifCount} active alerts`);
  console.log(`Total inventory movements: ${movementCount}`);

  // -------------------------------------------------------------------
  // Customer touchpoints: order messages and disputes with conversations
  // -------------------------------------------------------------------
  const deliveredOrders = await prisma.order.findMany({
    where: { shopId: shop.id, status: "delivered" },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const shippedOrders = await prisma.order.findMany({
    where: { shopId: shop.id, status: "shipped" },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  const pendingOrders = await prisma.order.findMany({
    where: { shopId: shop.id, status: "pending" },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  const allTouchpointOrders = [...deliveredOrders, ...shippedOrders, ...pendingOrders];

  // Order messages — casual conversations on various orders
  const messageThreads: { orderId: string; messages: { sender: string; body: string; offsetHours: number }[] }[] = [];

  if (deliveredOrders[0]) {
    messageThreads.push({
      orderId: deliveredOrders[0].id,
      messages: [
        { sender: "customer", body: "Hi, I received my order but one of the tea cups has a small chip on the rim. Can I get a replacement?", offsetHours: 2 },
        { sender: "vendor", body: "I'm sorry to hear that! Could you send a photo of the damage so we can process a replacement?", offsetHours: 5 },
        { sender: "customer", body: "Sure, I'll send a photo this evening. The rest of the set is beautiful though!", offsetHours: 8 },
        { sender: "vendor", body: "Thank you! We'll get a replacement cup shipped out as soon as we confirm the damage.", offsetHours: 10 },
      ],
    });
  }

  if (deliveredOrders[1]) {
    messageThreads.push({
      orderId: deliveredOrders[1].id,
      messages: [
        { sender: "customer", body: "Could you provide care instructions for the silk scarf? I want to make sure I wash it properly.", offsetHours: 24 },
        { sender: "vendor", body: "Great question! Hand wash only in cold water with mild detergent. Lay flat to dry, never wring. You can iron on low heat with a pressing cloth.", offsetHours: 26 },
        { sender: "customer", body: "Perfect, thank you so much!", offsetHours: 27 },
      ],
    });
  }

  if (shippedOrders[0]) {
    messageThreads.push({
      orderId: shippedOrders[0].id,
      messages: [
        { sender: "customer", body: "Any update on when my package will arrive? The tracking hasn't updated in 2 days.", offsetHours: 48 },
        { sender: "vendor", body: "Let me check with the carrier. Sometimes there are delays at customs. I'll get back to you within 24 hours.", offsetHours: 50 },
      ],
    });
  }

  if (pendingOrders[0]) {
    messageThreads.push({
      orderId: pendingOrders[0].id,
      messages: [
        { sender: "customer", body: "Hi, I just placed my order. Can you add gift wrapping? I forgot to mention it.", offsetHours: 0.5 },
        { sender: "vendor", body: "Of course! I'll add complimentary gift wrapping to your order. Would you like a message card as well?", offsetHours: 1 },
        { sender: "customer", body: "Yes please! Can it say 'Happy Birthday, Mom!'?", offsetHours: 1.5 },
        { sender: "vendor", body: "Done! I've added the gift wrap and card. Your order will be processed shortly.", offsetHours: 2 },
      ],
    });
  }

  if (deliveredOrders[2]) {
    messageThreads.push({
      orderId: deliveredOrders[2].id,
      messages: [
        { sender: "customer", body: "The spice box arrived and it smells amazing! Do you have any recipe recommendations?", offsetHours: 6 },
        { sender: "vendor", body: "So glad you like it! We have a recipe booklet on our website. The Sichuan pepper goes great with stir-fried chicken, and the star anise is perfect for braised pork belly.", offsetHours: 8 },
      ],
    });
  }

  for (const thread of messageThreads) {
    const order = allTouchpointOrders.find((o) => o.id === thread.orderId);
    if (!order) continue;
    for (const msg of thread.messages) {
      await prisma.orderMessage.create({
        data: {
          orderId: thread.orderId,
          sender: msg.sender,
          body: msg.body,
          createdAt: new Date(order.createdAt.getTime() + msg.offsetHours * 3600_000),
        },
      });
    }
  }

  const msgCount = await prisma.orderMessage.count();
  console.log(`Created ${msgCount} order messages across ${messageThreads.length} conversations`);

  // Generate NEW_MESSAGE notifications for threads that contain customer messages
  for (const thread of messageThreads) {
    const hasCustomerMsg = thread.messages.some((m) => m.sender === "customer");
    if (hasCustomerMsg) {
      const order = allTouchpointOrders.find((o) => o.id === thread.orderId);
      await notifyNewMessage(thread.orderId, order?.customerName ?? order?.customerEmail ?? "Customer");
    }
  }

  // Disputes — realistic scenarios
  // Dispute 1: Damaged item (resolved)
  if (deliveredOrders[3]) {
    const d1 = await prisma.dispute.create({
      data: {
        orderId: deliveredOrders[3].id,
        reason: "Item arrived damaged — the wooden box is cracked and two spice jars were broken during shipping.",
        status: "resolved",
        resolvedAt: new Date(deliveredOrders[3].createdAt.getTime() + 120 * 3600_000),
        createdAt: new Date(deliveredOrders[3].createdAt.getTime() + 48 * 3600_000),
      },
    });
    const d1Base = deliveredOrders[3].createdAt.getTime() + 48 * 3600_000;
    await prisma.disputeMessage.createMany({
      data: [
        { disputeId: d1.id, sender: "customer", body: "The package was clearly mishandled. The box was dented on arrival and two jars are shattered.", createdAt: new Date(d1Base) },
        { disputeId: d1.id, sender: "vendor", body: "I'm really sorry about this. We'll send a replacement set immediately at no cost. Could you confirm your shipping address is still correct?", createdAt: new Date(d1Base + 4 * 3600_000) },
        { disputeId: d1.id, sender: "customer", body: "Yes, same address. Thank you for handling this so quickly.", createdAt: new Date(d1Base + 6 * 3600_000) },
        { disputeId: d1.id, sender: "vendor", body: "Replacement shipped! Tracking: DHL-REPL-001. We've also filed a claim with the carrier. Sorry again for the inconvenience.", createdAt: new Date(d1Base + 24 * 3600_000) },
        { disputeId: d1.id, sender: "customer", body: "Received the replacement, everything looks perfect. Thank you!", createdAt: new Date(d1Base + 72 * 3600_000) },
      ],
    });
  }

  // Dispute 2: Wrong item received (under review)
  if (deliveredOrders[4]) {
    const d2 = await prisma.dispute.create({
      data: {
        orderId: deliveredOrders[4].id,
        reason: "Received the wrong color — ordered Blue but received Red.",
        status: "under_review",
        createdAt: new Date(deliveredOrders[4].createdAt.getTime() + 24 * 3600_000),
      },
    });
    const d2Base = deliveredOrders[4].createdAt.getTime() + 24 * 3600_000;
    await prisma.disputeMessage.createMany({
      data: [
        { disputeId: d2.id, sender: "customer", body: "I ordered the Medium Blue Tea Set but received a red one instead. Can this be corrected?", createdAt: new Date(d2Base) },
        { disputeId: d2.id, sender: "vendor", body: "I apologize for the mix-up. Let me check our inventory for the blue variant. Can you hold onto the red set for now?", createdAt: new Date(d2Base + 3 * 3600_000) },
        { disputeId: d2.id, sender: "customer", body: "Sure, I'll keep it safe. Please let me know when the correct one is ready.", createdAt: new Date(d2Base + 5 * 3600_000) },
      ],
    });
  }

  // Dispute 3: Late delivery (open)
  if (shippedOrders[1]) {
    const d3 = await prisma.dispute.create({
      data: {
        orderId: shippedOrders[1].id,
        reason: "Order has been in transit for over 2 weeks with no tracking updates. Requested delivery was within 5 business days.",
        status: "open",
        createdAt: new Date(shippedOrders[1].createdAt.getTime() + 336 * 3600_000),
      },
    });
    const d3Base = shippedOrders[1].createdAt.getTime() + 336 * 3600_000;
    await prisma.disputeMessage.createMany({
      data: [
        { disputeId: d3.id, sender: "customer", body: "It's been 14 days and the tracking still shows 'in transit'. I need this for a gift next week. What are my options?", createdAt: new Date(d3Base) },
      ],
    });
  }

  // Generate dispute notifications
  const seededDisputes = await prisma.dispute.findMany({
    include: { order: { select: { id: true } } },
  });
  for (const d of seededDisputes) {
    await notifyNewDispute(d.orderId, d.id, d.reason);
    if (d.status !== "open") {
      await notifyDisputeStatusChange(d.orderId, d.id, "open", d.status);
    }
  }

  const disputeCount = await prisma.dispute.count();
  const disputeMsgCount = await prisma.disputeMessage.count();
  console.log(`Created ${disputeCount} disputes with ${disputeMsgCount} dispute messages`);

  // -------------------------------------------------------------------
  // Product reviews with vendor replies
  // -------------------------------------------------------------------
  const reviewData: {
    productId: string;
    reviews: {
      customerEmail: string;
      customerName: string;
      rating: number;
      title: string | null;
      body: string;
      reply?: string;
      daysAgo: number;
    }[];
  }[] = [
    {
      productId: teaSet.id,
      reviews: [
        {
          customerEmail: "maria.rossi@gmail.com",
          customerName: "Maria Rossi",
          rating: 5,
          title: "Absolutely gorgeous!",
          body: "The craftsmanship is incredible. Each piece has unique patterns and the glaze is flawless. Perfect for my afternoon tea ritual.",
          reply: "Thank you so much, Maria! We're delighted you appreciate the artisan work. Enjoy your tea time!",
          daysAgo: 45,
        },
        {
          customerEmail: "anna.mueller@web.de",
          customerName: "Anna Müller",
          rating: 4,
          title: "Beautiful but fragile",
          body: "The tea set is stunning and arrived well-packaged. One small concern: the cups feel quite delicate. I'm a bit worried about daily use, but they're perfect for special occasions.",
          reply: "Hi Anna, these are handcrafted ceramics so they do require gentle handling. We recommend hand-washing only. Glad you love the aesthetics!",
          daysAgo: 30,
        },
        {
          customerEmail: "jean.dupont@yahoo.fr",
          customerName: "Jean Dupont",
          rating: 3,
          title: "Nice but smaller than expected",
          body: "The quality is good but the 'small' size is really quite tiny. I wish the product page had clearer dimensions. Still a nice gift though.",
          daysAgo: 20,
        },
      ],
    },
    {
      productId: silkScarf.id,
      reviews: [
        {
          customerEmail: "sofia.garcia@hotmail.com",
          customerName: "Sofia Garcia",
          rating: 5,
          title: "Luxurious silk!",
          body: "The colors are vibrant and the silk feels amazing against the skin. I've received so many compliments wearing this. Will definitely buy more.",
          reply: "Sofia, your kind words mean the world to us! Each scarf is hand-painted by our artisans. We'd love to have you back!",
          daysAgo: 15,
        },
        {
          customerEmail: "elena.popova@mail.ru",
          customerName: "Elena Popova",
          rating: 2,
          title: "Color faded after first wash",
          body: "Disappointed. Despite following the care instructions, the red color faded significantly after hand washing. For this price, I expected better dye quality.",
          reply: "Elena, we're sorry to hear about this. This is unusual for our scarves. Please contact us directly and we'll send a replacement. We take quality seriously.",
          daysAgo: 10,
        },
      ],
    },
    {
      productId: spiceBox.id,
      reviews: [
        {
          customerEmail: "luca.bianchi@outlook.com",
          customerName: "Luca Bianchi",
          rating: 5,
          title: "Amazing aromas!",
          body: "Opened the box and my kitchen instantly smelled like an Asian market. The spices are incredibly fresh and the wooden box is a lovely keepsake. Bought two more as gifts.",
          daysAgo: 25,
        },
        {
          customerEmail: "marco.conti@gmail.com",
          customerName: "Marco Conti",
          rating: 4,
          title: "Great selection, could use recipes",
          body: "The spice variety is excellent and clearly high quality. Would have been nice to include a small recipe card with suggestions for each spice. Minor gripe on an otherwise great product.",
          reply: "Marco, great suggestion! We're actually working on including recipe cards in future batches. Thanks for the feedback!",
          daysAgo: 8,
        },
      ],
    },
  ];

  const now = new Date();
  for (const productGroup of reviewData) {
    for (const r of productGroup.reviews) {
      const createdAt = new Date(now.getTime() - r.daysAgo * 86400_000);
      const review = await prisma.productReview.create({
        data: {
          productId: productGroup.productId,
          customerId: customerMap.get(r.customerEmail),
          customerEmail: r.customerEmail,
          customerName: r.customerName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          createdAt,
        },
      });

      if (r.reply) {
        await prisma.reviewReply.create({
          data: {
            reviewId: review.id,
            body: r.reply,
            createdAt: new Date(createdAt.getTime() + 12 * 3600_000),
          },
        });
      }

      await notifyNewReview(review.id, productGroup.productId);
    }
  }

  const reviewCount = await prisma.productReview.count();
  const replyCount = await prisma.reviewReply.count();
  console.log(`Created ${reviewCount} product reviews with ${replyCount} vendor replies`);

  const finalNotifCount = await prisma.notification.count();
  console.log(`Total notifications: ${finalNotifCount}`);

  console.log("\nSeed completed successfully!");
  console.log(`\nVendor login:\n  Email: moritz@mercado-oriental.com\n  Password: password123`);
  console.log(`\nCustomer login (any of ${customerPool.length} accounts):\n  Email: maria.rossi@gmail.com\n  Password: customer123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
