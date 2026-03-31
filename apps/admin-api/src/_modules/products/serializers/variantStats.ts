interface OrderItem {
  quantity: number;
  unitPrice: number;
  order: {
    id: string;
    customerEmail: string;
    customerName: string | null;
    status: string;
    createdAt: Date;
  };
}

interface VariantAttributeValue {
  productAttributeValue: {
    value: string;
    productAttribute: { id: string; name: string };
  };
}

export interface RawVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number | null;
  orderItems: OrderItem[];
  productVariantAttributeValues: VariantAttributeValue[];
}

export interface VariantStat {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  stockValue: number;
  sold: number;
  revenue: number;
  daysSinceLastSale: number | null;
  attributes: { attributeName: string; value: string }[];
}

export interface VariantStatsAccumulator {
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  totalStockValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalSold: number;
  totalRevenue: number;
  salesByDay: Record<string, { units: number; revenue: number }>;
  customers: Map<
    string,
    {
      email: string;
      name: string | null;
      totalSpent: number;
      totalUnits: number;
      orderCount: number;
      lastOrder: Date;
      firstOrder: Date;
    }
  >;
}

function availableOf(stock: number, reserved: number) {
  return stock - reserved;
}

function effectiveThreshold(variant: RawVariant, shopDefault: number) {
  return variant.lowStockThreshold ?? shopDefault;
}

/** Count units sold from completed or delivered orders (legacy + current statuses). */
function isCountedSaleStatus(status: string) {
  return status === "completed" || status === "delivered";
}

export function serializeVariantStats(
  variants: RawVariant[],
  now: Date,
  shopDefaultLowStockThreshold: number
): { stats: VariantStat[]; accumulator: VariantStatsAccumulator } {
  const accumulator: VariantStatsAccumulator = {
    totalStock: 0,
    totalReserved: 0,
    totalAvailable: 0,
    totalStockValue: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    totalSold: 0,
    totalRevenue: 0,
    salesByDay: {},
    customers: new Map(),
  };

  const stats = variants.map((v) => {
    const reserved = v.reservedStock ?? 0;
    const avail = availableOf(v.stock, reserved);
    const threshold = effectiveThreshold(v, shopDefaultLowStockThreshold);

    accumulator.totalStock += v.stock;
    accumulator.totalReserved += reserved;
    accumulator.totalAvailable += avail;
    accumulator.totalStockValue += avail * v.price;

    if (avail === 0) accumulator.outOfStockCount++;
    else if (avail > 0 && avail <= threshold) accumulator.lowStockCount++;

    let variantSold = 0;
    let variantRevenue = 0;
    let lastSaleDate: Date | null = null;

    for (const item of v.orderItems) {
      if (isCountedSaleStatus(item.order.status)) {
        variantSold += item.quantity;
        variantRevenue += item.quantity * item.unitPrice;

        if (!lastSaleDate || item.order.createdAt > lastSaleDate) {
          lastSaleDate = item.order.createdAt;
        }

        accumulator.totalSold += item.quantity;
        accumulator.totalRevenue += item.quantity * item.unitPrice;

        const day = item.order.createdAt.toISOString().split("T")[0];
        if (!accumulator.salesByDay[day]) {
          accumulator.salesByDay[day] = { units: 0, revenue: 0 };
        }
        accumulator.salesByDay[day].units += item.quantity;
        accumulator.salesByDay[day].revenue += item.quantity * item.unitPrice;

        const email = item.order.customerEmail;
        const existing = accumulator.customers.get(email);
        if (existing) {
          existing.totalSpent += item.quantity * item.unitPrice;
          existing.totalUnits += item.quantity;
          existing.orderCount += 1;
          if (item.order.createdAt > existing.lastOrder) {
            existing.lastOrder = item.order.createdAt;
          }
          if (item.order.createdAt < existing.firstOrder) {
            existing.firstOrder = item.order.createdAt;
          }
        } else {
          accumulator.customers.set(email, {
            email,
            name: item.order.customerName,
            totalSpent: item.quantity * item.unitPrice,
            totalUnits: item.quantity,
            orderCount: 1,
            lastOrder: item.order.createdAt,
            firstOrder: item.order.createdAt,
          });
        }
      }
    }

    const daysSinceLastSale = lastSaleDate
      ? Math.floor((now.getTime() - lastSaleDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      reservedStock: reserved,
      availableStock: avail,
      lowStockThreshold: threshold,
      stockValue: avail * v.price,
      sold: variantSold,
      revenue: variantRevenue,
      daysSinceLastSale,
      attributes: v.productVariantAttributeValues.map((pv) => ({
        attributeName: pv.productAttributeValue.productAttribute.name,
        value: pv.productAttributeValue.value,
      })),
    };
  });

  return { stats, accumulator };
}
