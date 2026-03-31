import type { VariantStat, VariantStatsAccumulator } from "./variantStats";

interface SalesTimeline {
  date: string;
  units: number;
  revenue: number;
}

interface WeeklyComparison {
  thisWeek: { revenue: number; units: number };
  lastWeek: { revenue: number; units: number };
  revenueChangePercent: number;
  unitsChangePercent: number;
}

export interface SalesPerformance {
  totalSold: number;
  totalRevenue: number;
  avgSellingPrice: number;
  salesVelocity: number;
  salesTimeline: SalesTimeline[];
  weekly: WeeklyComparison;
  daysSinceLastSale: number | null;
  bestVariant: { name: string; revenue: number; sold: number } | null;
  worstVariant: { name: string; revenue: number; sold: number } | null;
}

function computePercentChange(current: number, previous: number): number {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? 100 : 0;
}

export function serializeSalesPerformance(
  accumulator: VariantStatsAccumulator,
  variantStats: VariantStat[],
  now: Date
): SalesPerformance {
  // Sales timeline
  const salesTimeline = Object.entries(accumulator.salesByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  // Sales velocity
  const allDates = salesTimeline.map((s) => s.date);
  const firstSaleDate = allDates.length > 0 ? allDates[0] : null;
  const lastSaleDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;
  const daysSinceFirstSale = firstSaleDate
    ? Math.max(1, Math.floor((now.getTime() - new Date(firstSaleDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const salesVelocity = accumulator.totalSold / daysSinceFirstSale;

  // Weekly comparison
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  let thisWeekRevenue = 0;
  let thisWeekUnits = 0;
  let lastWeekRevenue = 0;
  let lastWeekUnits = 0;

  for (const entry of salesTimeline) {
    const d = new Date(entry.date);
    if (d >= startOfThisWeek) {
      thisWeekRevenue += entry.revenue;
      thisWeekUnits += entry.units;
    } else if (d >= startOfLastWeek && d < startOfThisWeek) {
      lastWeekRevenue += entry.revenue;
      lastWeekUnits += entry.units;
    }
  }

  // Average selling price
  const avgSellingPrice = accumulator.totalSold > 0 ? accumulator.totalRevenue / accumulator.totalSold : 0;

  // Best / worst variants
  const sortedByRevenue = [...variantStats].sort((a, b) => b.revenue - a.revenue);
  const bestVariant =
    sortedByRevenue.length > 0
      ? { name: sortedByRevenue[0].name, revenue: sortedByRevenue[0].revenue, sold: sortedByRevenue[0].sold }
      : null;
  const worstVariant =
    sortedByRevenue.length > 1
      ? {
          name: sortedByRevenue[sortedByRevenue.length - 1].name,
          revenue: sortedByRevenue[sortedByRevenue.length - 1].revenue,
          sold: sortedByRevenue[sortedByRevenue.length - 1].sold,
        }
      : null;

  // Days since last sale (product level)
  const productLastSaleDate = lastSaleDate ? new Date(lastSaleDate) : null;
  const daysSinceLastSale = productLastSaleDate
    ? Math.floor((now.getTime() - productLastSaleDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    totalSold: accumulator.totalSold,
    totalRevenue: accumulator.totalRevenue,
    avgSellingPrice,
    salesVelocity,
    salesTimeline,
    weekly: {
      thisWeek: { revenue: thisWeekRevenue, units: thisWeekUnits },
      lastWeek: { revenue: lastWeekRevenue, units: lastWeekUnits },
      revenueChangePercent: computePercentChange(thisWeekRevenue, lastWeekRevenue),
      unitsChangePercent: computePercentChange(thisWeekUnits, lastWeekUnits),
    },
    daysSinceLastSale,
    bestVariant,
    worstVariant,
  };
}
