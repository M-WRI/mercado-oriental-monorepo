import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { applyInitialOrderInventory, syncLowStockNotificationsForVariants } from "../src/lib/inventory";
import { recordMovement, INV_REASON } from "../src/lib/inventory";
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

  const hashedPassword = await bcrypt.hash("password123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  // 1. Create Moritz
  const moritzUser = await prisma.user.create({
    data: {
      email: "moritz@mercado-oriental.com",
      password: hashedPassword,
      name: "Moritz Wright",
    },
  });

  const moritzCustomer = await prisma.customer.create({
    data: {
      email: "moritz@mercado-oriental.com",
      password: customerPassword,
      name: "Moritz Wright",
      phone: "+49 151 12345678",
    },
  });

  // 2. Create other Users (Vendors)
  const vendors = [];
  for (let i = 0; i < 20; i++) {
    vendors.push(await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        name: faker.person.fullName(),
      }
    }));
  }
  const allVendors = [moritzUser, ...vendors];

  // 3. Create other Customers
  const customers = [];
  for (let i = 0; i < 50; i++) {
    customers.push(await prisma.customer.create({
      data: {
        email: faker.internet.email(),
        password: customerPassword,
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      }
    }));
  }
  const allCustomers = [moritzCustomer, ...customers];

  // 4. Create 50 Shops
  const shops = [];
  for (let i = 0; i < 50; i++) {
    // Make sure Moritz has at least 3 shops
    const owner = i < 3 ? moritzUser : faker.helpers.arrayElement(allVendors);
    shops.push(await prisma.shop.create({
      data: {
        name: faker.company.name() + " Market",
        description: faker.company.catchPhrase(),
        userId: owner.id,
        defaultLowStockThreshold: faker.number.int({ min: 5, max: 20 }),
      }
    }));
  }

  // 5. Create 200 Products (4 per shop)
  const products = [];
  const allVariants = [];
  for (const shop of shops) {
    // Create some attributes for the shop
    const sizeAttr = await prisma.productAttribute.create({
      data: {
        name: "Size",
        shopId: shop.id,
        productAttributeValues: {
          create: [{ value: "Small" }, { value: "Medium" }, { value: "Large" }]
        }
      },
      include: { productAttributeValues: true }
    });

    const colorAttr = await prisma.productAttribute.create({
      data: {
        name: "Color",
        shopId: shop.id,
        productAttributeValues: {
          create: [{ value: "Red" }, { value: "Blue" }, { value: "Green" }]
        }
      },
      include: { productAttributeValues: true }
    });

    for (let p = 0; p < 4; p++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          shopId: shop.id,
          isActive: true,
        }
      });
      products.push(product);

      // Create variants
      for (let v = 0; v < 3; v++) {
        const sizeVal = faker.helpers.arrayElement(sizeAttr.productAttributeValues);
        const colorVal = faker.helpers.arrayElement(colorAttr.productAttributeValues);

        const variant = await prisma.productVariant.create({
          data: {
            name: `${sizeVal.value} ${colorVal.value} ${product.name}`,
            price: parseFloat(faker.commerce.price()),
            stock: faker.number.int({ min: 50, max: 200 }),
            lowStockThreshold: faker.number.int({ min: 5, max: 15 }),
            productId: product.id,
            productVariantAttributeValues: {
              create: [
                { productAttributeValueId: sizeVal.id },
                { productAttributeValueId: colorVal.id }
              ]
            }
          }
        });
        allVariants.push(variant);
      }
    }
  }

  // 6. Create Orders
  const orderStatuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
  const orders = [];
  
  for (let i = 0; i < 300; i++) {
    // Make sure Moritz places at least 20 orders, and receives some in his shops (already likely since he owns shops)
    const customer = i < 20 ? moritzCustomer : faker.helpers.arrayElement(allCustomers);
    const shop = i >= 20 && i < 40 ? shops[0] : faker.helpers.arrayElement(shops); // Force orders on Moritz's shop
    const shopVariants = allVariants.filter(v => v.productId && products.find(p => p.id === v.productId && p.shopId === shop.id));
    
    if (shopVariants.length === 0) continue;

    const itemCount = faker.number.int({ min: 1, max: 4 });
    const selectedVariants = faker.helpers.arrayElements(shopVariants, Math.min(itemCount, shopVariants.length));
    
    const items = selectedVariants.map(v => ({
      quantity: faker.number.int({ min: 1, max: 3 }),
      unitPrice: v.price,
      productName: "",
      variantName: v.name,
      productVariantId: v.id,
    }));

    const total = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
    const status = faker.helpers.arrayElement(orderStatuses);
    const carrier = ["DHL", "FedEx", "UPS"][faker.number.int({ min: 0, max: 2 })];

    const orderDate = faker.date.recent({ days: 90 });
    const order = await prisma.order.create({
      data: {
        customerEmail: customer.email,
        customerName: customer.name,
        customerId: customer.id,
        status,
        totalAmount: total,
        shopId: shop.id,
        shippingAddress: faker.location.streetAddress(),
        trackingNumber: ["shipped", "delivered"].includes(status) ? faker.string.alphanumeric(10).toUpperCase() : null,
        carrier: ["shipped", "delivered"].includes(status) ? carrier : null,
        createdAt: orderDate,
        orderItems: { create: items }
      }
    });
    
    // Attempt inventory apply
    try {
        await applyInitialOrderInventory(prisma, order.id);
    } catch(err) {
        // ignore out of stock for faker data
    }
    orders.push(order);
  }

  // 7. Interactions: Messages
  for (let i = 0; i < 50; i++) {
    const order = i < 5 ? orders.find(o => o.customerId === moritzCustomer.id) || orders[i] : faker.helpers.arrayElement(orders);
    if (!order) continue;
    await prisma.orderMessage.create({
      data: {
        orderId: order.id,
        sender: "customer",
        body: faker.lorem.sentences(),
      }
    });
    await prisma.orderMessage.create({
      data: {
        orderId: order.id,
        sender: "vendor",
        body: faker.lorem.sentences(),
      }
    });
    await notifyNewMessage(order.id, order.customerName || "Customer");
  }

  // 8. Interactions: Disputes
  for (let i = 0; i < 30; i++) {
     const order = i < 5 ? orders.find(o => o.customerId === moritzCustomer.id) || orders[i] : faker.helpers.arrayElement(orders);
     if (!order) continue;
     const dispute = await prisma.dispute.create({
       data: {
         orderId: order.id,
         reason: faker.lorem.sentence(),
         status: "open",
       }
     });
     await prisma.disputeMessage.create({
       data: {
         disputeId: dispute.id,
         sender: "customer",
         body: faker.lorem.sentences(),
       }
     });
     await prisma.disputeMessage.create({
       data: {
         disputeId: dispute.id,
         sender: "vendor",
         body: faker.lorem.sentences(),
       }
     });
     await notifyNewDispute(order.id, dispute.id, dispute.reason);
  }

  // 9. Interactions: Reviews
  for (let i = 0; i < 150; i++) {
     const order = i < 10 ? orders.find(o => o.customerId === moritzCustomer.id && o.status === "delivered") || orders[i] : faker.helpers.arrayElement(orders);
     if (!order) continue;
     
     const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id }, include: { productVariant: true } });
     if (orderItems.length === 0 || (!orderItems[0].productVariant)) continue;
     const productId = orderItems[0].productVariant.productId;
     
     const review = await prisma.productReview.create({
       data: {
         productId,
         customerId: order.customerId,
         customerEmail: order.customerEmail,
         customerName: order.customerName,
         rating: faker.number.int({ min: 1, max: 5 }),
         title: faker.lorem.words(3),
         body: faker.lorem.paragraph(),
       }
     });

     if (faker.datatype.boolean()) {
       await prisma.reviewReply.create({
         data: {
           reviewId: review.id,
           body: faker.lorem.sentences(),
         }
       });
     }
     
     await notifyNewReview(review.id, productId);
  }

  // 10. Drain some specific variants to trigger notify
  for (let i = 0; i < 10; i++) {
      const variant = faker.helpers.arrayElement(allVariants);
      await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: 0 }
      });
  }

  await syncLowStockNotificationsForVariants(allVariants.map(v => v.id));

  // Moritz as a vendor having some disputes & messages to answer
  const moritzShops = shops.filter(s => s.userId === moritzUser.id);
  const moritzShopIds = moritzShops.map(s => s.id);
  const moritzReceivedOrders = orders.filter(o => moritzShopIds.includes(o.shopId));

  for (let i = 0; i < Math.min(5, moritzReceivedOrders.length); i++) {
     const o = moritzReceivedOrders[i];
     await prisma.orderMessage.create({
       data: {
         orderId: o.id,
         sender: "customer",
         body: "I have a question about this!"
       }
     });
     await notifyNewMessage(o.id, o.customerName || "Customer");
     
     const dispute = await prisma.dispute.create({
       data: {
         orderId: o.id,
         reason: "Item never arrived",
         status: "open",
       }
     });
     await prisma.disputeMessage.create({
       data: {
         disputeId: dispute.id,
         sender: "customer",
         body: "Please help!",
       }
     });
     await notifyNewDispute(o.id, dispute.id, dispute.reason);
  }

  console.log("Seeding done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
