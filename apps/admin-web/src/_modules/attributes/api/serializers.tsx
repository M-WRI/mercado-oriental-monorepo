type CreateAttributeFormData = {
  shopId: string;
  name: string;
  description?: string;
  values: string[];
};

export const createAttributeRequestSerializer = (data: CreateAttributeFormData) => ({
  shopId: data.shopId,
  name: data.name,
  description: data.description,
  productAttributeValues: (data.values ?? []).map((value: string) => ({ value })),
});

export const serializer = {
    createAttributeRequestSerializer,
}