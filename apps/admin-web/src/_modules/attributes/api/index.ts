import type { TQueryKey } from "@mercado/shared-ui";
export * from "./serializers"

export const getAttributes = {
  queryKey: [["attributes"]] as TQueryKey,
  url: "/attributes",
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
}

export const deleteAttributeValueRequest = {
  queryKey: (id?: string) => [["attributes", id, "values"]] as TQueryKey,
  url: (id?: string, valueId?: string) => `/attributes/${id}/values/${valueId}`,
}