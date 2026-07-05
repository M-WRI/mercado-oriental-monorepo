import type { ICategory } from "../types";

export type CategoryFormValues = {
  name: string;
  slug: string;
};

export function countCategories(categories: ICategory[]): number {
  return categories.reduce(
    (sum, cat) => sum + 1 + countCategories(cat.children ?? []),
    0
  );
}
