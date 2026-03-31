interface VariantWithProduct {
  id: string;
  name: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number | null;
  price: number;
  product: { id: string; name: string; shop: { defaultLowStockThreshold: number } };
}

export interface AlertVariant {
  id: string;
  name: string;
  stock: number;
  available: number;
  productName: string;
}

export interface InventoryAlerts {
  alertVariants: AlertVariant[];
  outOfStockCount: number;
  lowStockCount: number;
  totalStock: number;
  totalStockValue: number;
}

function available(stock: number, reserved: number) {
  return stock - reserved;
}

function threshold(v: VariantWithProduct) {
  return v.lowStockThreshold ?? v.product.shop.defaultLowStockThreshold;
}

export function serializeInventoryAlerts(allVariants: VariantWithProduct[]): InventoryAlerts {
  const alertVariants = allVariants
    .filter((v) => available(v.stock, v.reservedStock) <= threshold(v))
    .sort((a, b) => available(a.stock, a.reservedStock) - available(b.stock, b.reservedStock))
    .slice(0, 10)
    .map((v) => ({
      id: v.id,
      name: v.name,
      stock: v.stock,
      available: available(v.stock, v.reservedStock),
      productName: v.product.name,
    }));

  const outOfStockCount = allVariants.filter(
    (v) => available(v.stock, v.reservedStock) === 0
  ).length;
  const lowStockCount = allVariants.filter((v) => {
    const a = available(v.stock, v.reservedStock);
    return a > 0 && a <= threshold(v);
  }).length;

  const totalStock = allVariants.reduce((s, v) => s + available(v.stock, v.reservedStock), 0);
  const totalStockValue = allVariants.reduce(
    (s, v) => s + available(v.stock, v.reservedStock) * v.price,
    0
  );

  return {
    alertVariants,
    outOfStockCount,
    lowStockCount,
    totalStock,
    totalStockValue,
  };
}
