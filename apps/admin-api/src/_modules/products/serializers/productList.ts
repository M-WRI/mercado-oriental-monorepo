interface OrderItem {
  quantity: number;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number | null;
  orderItems: OrderItem[];
}

interface RawProduct {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  shop: { defaultLowStockThreshold: number };
  productVariants: Variant[];
}

function available(stock: number, reserved: number) {
  return stock - reserved;
}

function resolveThreshold(v: Variant, shopDefault: number) {
  return v.lowStockThreshold ?? shopDefault;
}

function serializeVariant(v: Variant, shopDefault: number) {
  const avail = available(v.stock, v.reservedStock);
  const thresh = resolveThreshold(v, shopDefault);
  return {
    id: v.id,
    name: v.name,
    price: v.price,
    stock: v.stock,
    reservedStock: v.reservedStock,
    availableStock: avail,
    lowStockThreshold: thresh,
    isLow: avail > 0 && avail <= thresh,
    isOut: avail <= 0,
  };
}

export function serializeProductListItem(product: RawProduct) {
  const variants = product.productVariants;
  const shopDefault = product.shop.defaultLowStockThreshold;

  const prices = variants.map((v) => v.price);
  const priceMin = prices.length > 0 ? Math.min(...prices) : 0;
  const priceMax = prices.length > 0 ? Math.max(...prices) : 0;

  const totalStock = variants.reduce(
    (sum, v) => sum + available(v.stock, v.reservedStock),
    0
  );
  const totalSold = variants.reduce(
    (sum, v) => sum + v.orderItems.reduce((s, oi) => s + oi.quantity, 0),
    0
  );

  const serializedVariants = variants.map((v) =>
    serializeVariant(v, shopDefault)
  );

  const hasOutOfStock = serializedVariants.some((v) => v.isOut);
  const hasLowStock = serializedVariants.some((v) => v.isLow);
  const status: "out_of_stock" | "low_stock" | "in_stock" = hasOutOfStock
    ? "out_of_stock"
    : hasLowStock
      ? "low_stock"
      : "in_stock";

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    isActive: product.isActive,
    shopId: product.shopId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    variantCount: variants.length,
    priceMin,
    priceMax,
    totalStock,
    totalSold,
    status,
    variants: serializedVariants,
  };
}

export function serializeProductList(products: RawProduct[]) {
  return products.map(serializeProductListItem);
}
