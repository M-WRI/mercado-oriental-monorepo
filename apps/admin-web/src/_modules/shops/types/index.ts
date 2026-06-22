export interface IShop {
  id: string;
  name: string;
  description: string | null;
  defaultLowStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}
