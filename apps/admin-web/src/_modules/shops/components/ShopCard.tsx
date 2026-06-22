import { useTranslation } from "react-i18next";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import type { IShop } from "../types";

const GRADIENTS = [
  "bg-gradient-to-br from-gray-800 to-gray-600",
  "bg-gradient-to-br from-amber-700 to-amber-500",
  "bg-gradient-to-br from-emerald-700 to-emerald-500",
  "bg-gradient-to-br from-blue-700 to-blue-500",
  "bg-gradient-to-br from-violet-700 to-violet-500",
  "bg-gradient-to-br from-rose-700 to-rose-500",
];

type ShopCardProps = {
  shop: IShop;
  index: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const ShopCard = ({ shop, index, onSelect, onEdit, onDelete }: ShopCardProps) => {
  const { t } = useTranslation();
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-300 transition-colors">
      <button type="button" onClick={onSelect} className="text-left flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center shrink-0`}>
            <span className="text-white text-lg font-bold select-none">
              {shop.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{shop.name}</h3>
            {shop.createdAt && (
              <p className="text-xs text-gray-400">
                {new Date(shop.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {shop.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{shop.description}</p>
        )}
      </button>
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg py-2 transition-colors"
        >
          {t("shops.openShop")}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label={t("common.edit")}
        >
          <MdEdit size={18} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label={t("common.delete")}
        >
          <MdDeleteOutline size={18} />
        </button>
      </div>
    </div>
  );
};
