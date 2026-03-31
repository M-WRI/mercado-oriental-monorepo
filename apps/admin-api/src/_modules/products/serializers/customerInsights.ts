import type { VariantStatsAccumulator } from "./variantStats";

interface CustomerEntry {
  email: string;
  name: string | null;
  totalSpent: number;
  totalUnits: number;
  orderCount: number;
  lastOrder: Date;
  firstOrder: Date;
}

export interface CustomerInsights {
  totalCustomers: number;
  repeatBuyerCount: number;
  topBuyer: { name: string | null; email: string; totalSpent: number } | null;
  customers: CustomerEntry[];
}

export function serializeCustomerInsights(
  accumulator: VariantStatsAccumulator
): CustomerInsights {
  const customerList = Array.from(accumulator.customers.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const repeatBuyerCount = customerList.filter((c) => c.orderCount > 1).length;

  const topBuyer =
    customerList.length > 0
      ? {
          name: customerList[0].name,
          email: customerList[0].email,
          totalSpent: customerList[0].totalSpent,
        }
      : null;

  return {
    totalCustomers: customerList.length,
    repeatBuyerCount,
    topBuyer,
    customers: customerList,
  };
}
