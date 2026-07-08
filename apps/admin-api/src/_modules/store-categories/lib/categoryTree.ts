import { prisma } from "../../../lib";
import { AppError, ERROR_CODES } from "../../../lib/error";

export async function getDescendantCategoryIds(categoryId: string): Promise<Set<string>> {
  const all = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  const childrenByParent = new Map<string | null, string[]>();
  for (const cat of all) {
    const siblings = childrenByParent.get(cat.parentId) ?? [];
    siblings.push(cat.id);
    childrenByParent.set(cat.parentId, siblings);
  }

  const descendants = new Set<string>();
  const queue = [...(childrenByParent.get(categoryId) ?? [])];

  while (queue.length > 0) {
    const id = queue.shift()!;
    descendants.add(id);
    queue.push(...(childrenByParent.get(id) ?? []));
  }

  return descendants;
}

/** Category id plus all descendant ids — for product list filters. */
export async function getCategoryFilterIds(categoryId: string): Promise<string[]> {
  const descendants = await getDescendantCategoryIds(categoryId);
  return [categoryId, ...descendants];
}

export async function assertValidCategoryParent(
  categoryId: string | undefined,
  parentId: string | null | undefined
) {
  if (parentId == null) return;

  if (categoryId && parentId === categoryId) {
    throw new AppError({
      case: "category_parent_self",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { id: true },
  });

  if (!parent) {
    throw new AppError({
      case: "category_parent",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (categoryId) {
    const descendants = await getDescendantCategoryIds(categoryId);
    if (descendants.has(parentId)) {
      throw new AppError({
        case: "category_parent_cycle",
        code: ERROR_CODES.INVALID,
        statusCode: 400,
      });
    }
  }
}
