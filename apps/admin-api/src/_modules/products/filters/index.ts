import type { ListFilterConfig } from "../../../lib";

export const productListFilter: ListFilterConfig = {
  searchFields: ["name", "description"],
  sortableFields: ["name", "createdAt", "updatedAt"],
  defaultSort: { field: "createdAt", order: "desc" },
  selectFilters: {
    isActive: {
      prismaField: "isActive",
      allowedValues: ["true", "false"],
    },
  },
};
