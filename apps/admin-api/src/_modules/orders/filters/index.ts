import type { ListFilterConfig } from "../../../lib";

export const orderListFilter: ListFilterConfig = {
  searchFields: ["customerEmail", "customerName"],
  sortableFields: ["createdAt", "updatedAt", "totalAmount"],
  defaultSort: { field: "createdAt", order: "desc" },
  selectFilters: {
    status: {
      prismaField: "status",
      allowedValues: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
};
