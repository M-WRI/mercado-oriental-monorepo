interface OrderWithAmount {
  totalAmount: number;
  createdAt: Date;
}

export interface RevenueTimelineEntry {
  date: string;
  revenue: number;
  orders: number;
}

export interface WeeklyComparison {
  thisWeekRevenue: number;
  prevWeekRevenue: number;
  revenueChangePercent: number;
}

export function serializeRevenueTimeline(
  allOrders: OrderWithAmount[],
  todayStart: Date
): RevenueTimelineEntry[] {
  const timeline: RevenueTimelineEntry[] = [];

  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOrders = allOrders.filter(
      (o) => o.createdAt >= dayStart && o.createdAt < dayEnd
    );

    timeline.push({
      date: dayStart.toISOString().slice(0, 10),
      revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
      orders: dayOrders.length,
    });
  }

  return timeline;
}

export function serializeWeeklyComparison(
  allOrders: OrderWithAmount[],
  weekStart: Date,
  prevWeekStart: Date
): WeeklyComparison {
  const thisWeekOrders = allOrders.filter((o) => o.createdAt >= weekStart);
  const prevWeekOrders = allOrders.filter(
    (o) => o.createdAt >= prevWeekStart && o.createdAt < weekStart
  );

  const thisWeekRevenue = thisWeekOrders.reduce((s, o) => s + o.totalAmount, 0);
  const prevWeekRevenue = prevWeekOrders.reduce((s, o) => s + o.totalAmount, 0);

  return {
    thisWeekRevenue,
    prevWeekRevenue,
    revenueChangePercent:
      prevWeekRevenue > 0
        ? ((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
        : 0,
  };
}
