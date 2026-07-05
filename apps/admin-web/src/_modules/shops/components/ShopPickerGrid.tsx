import { ShopCard } from "./ShopCard";
import type { IShop } from "../types";

type ShopPickerGridProps = {
  shops: IShop[];
  onSelect: (shopId: string) => void;
  onEdit: (shopId: string) => void;
  onDelete: (shop: IShop) => void;
};

export function ShopPickerGrid({ shops, onSelect, onEdit, onDelete }: ShopPickerGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {shops.map((shop, index) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          index={index}
          onSelect={() => onSelect(shop.id)}
          onEdit={() => onEdit(shop.id)}
          onDelete={() => onDelete(shop)}
        />
      ))}
    </div>
  );
}
