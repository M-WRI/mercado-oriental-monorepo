export interface IShop {
  id: string;
  name: string;
  description: string | null;
}

export interface IProductAttribute {
  id: string;
  name: string;
  description: string | null;
  shopId: string;
  productAttributeValues: IProductAttributeValue[];
}

export interface IProductAttributeValue {
  id: string;
  value: string;
  productAttributeId: string;
}

export interface INewAttribute {
  tempId: string;
  name: string;
  description: string;
  values: string[];
}

export interface IProductInfoData {
  name: string;
  description: string;
  shopId: string;
  shopName: string;
}

export interface IAttributesData {
  selectedAttributes: IProductAttribute[];
  newAttributes: INewAttribute[];
}

export interface IVariantAttributeSelection {
  attributeId: string;
  attributeName: string;
  valueId: string;
  valueName: string;
}

export interface IWizardVariant {
  tempId: string;
  name: string;
  price: number;
  stock: number;
  attributeSelections: IVariantAttributeSelection[];
}

export interface IVariantAttributeValueLink {
  id: string;
  productVariantId: string;
  productAttributeValueId: string;
  productAttributeValue: {
    id: string;
    value: string;
    productAttributeId: string;
    productAttribute: {
      id: string;
      name: string;
    };
  };
}

export interface IRawVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  productId: string;
  productVariantAttributeValues: IVariantAttributeValueLink[];
}

export interface IEditableVariant {
  id?: string;
  tempId: string;
  name: string;
  price: number;
  stock: number;
  attributeValueIds: string[];
  attributeSelections: IVariantAttributeSelection[];
}

export interface IVariantStat {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock?: number;
  availableStock?: number;
  lowStockThreshold?: number;
  stockValue: number;
  sold: number;
  revenue: number;
  daysSinceLastSale: number | null;
  attributes: { attributeName: string; value: string }[];
}

export interface ICustomerStat {
  email: string;
  name: string | null;
  totalSpent: number;
  totalUnits: number;
  orderCount: number;
  lastOrder: string;
  firstOrder: string;
}

export interface IProductAnalytics {
  totalStock: number;
  totalStockOnHand?: number;
  totalReserved?: number;
  totalStockValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  lowStockThreshold: number;

  totalSold: number;
  totalRevenue: number;
  avgSellingPrice: number;
  salesVelocity: number;
  salesTimeline: { date: string; units: number; revenue: number }[];

  thisWeek: { revenue: number; units: number };
  lastWeek: { revenue: number; units: number };
  revenueChangePercent: number;
  unitsChangePercent: number;

  productAge: number;
  daysSinceLastSale: number | null;

  bestVariant: { name: string; revenue: number; sold: number } | null;
  worstVariant: { name: string; revenue: number; sold: number } | null;

  totalCustomers: number;
  repeatBuyerCount: number;
  topBuyer: { name: string | null; email: string; totalSpent: number } | null;
  customers: ICustomerStat[];
}

export interface IProductDetailResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  shop: { id: string; name: string; defaultLowStockThreshold?: number };
  createdAt: string;
  analytics: IProductAnalytics;
  variants: IVariantStat[];
}
