import type { Category, FlatCategory } from "../types";

export function flattenCategories(
  categories: Category[],
  depth = 0,
): FlatCategory[] {
  return categories.flatMap((cat) => [
    {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      depth,
    },
    ...flattenCategories(cat.children, depth + 1),
  ]);
}
