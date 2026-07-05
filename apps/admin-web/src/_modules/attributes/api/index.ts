import type { TQueryKey } from "@mercado/shared-ui";
export * from "./serializers"

export const getAttributes = {
  queryKey: (shopId: string) => [["attributes", shopId]] as TQueryKey,
  url: (shopId: string) => `/attributes?shopId=${shopId}`,
};

export const createAttribute = {
  url: "/attributes",
}

export const getAttribute = {
  queryKey: (id?: string) => [["attributes", id]] as TQueryKey,
  url: (id?: string) => `/attributes/${id}`,
}

export const updateAttribute = {
  url: (id: string) => `/attributes/${id}`,
};

export const deleteAttribute = {
  url: (id: string) => `/attributes/${id}`,
};

export const bulkDeleteAttributes = {
  url: "/attributes/bulk",
};

export const deleteAttributeValueRequest = {
  queryKey: (id?: string) => [["attributes", id, "values"]] as TQueryKey,
  url: (id?: string, valueId?: string) => `/attributes/${id}/values/${valueId}`,
};

export const createAttributeValue = {
  url: (attributeId: string) => `/attributes/${attributeId}/values`,
};