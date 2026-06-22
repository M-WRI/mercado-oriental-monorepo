import { Response, Request } from "express";
import { prisma, asyncHandler } from "../../../lib";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  // Fetch all categories and build tree in-memory for efficiency
  const allCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });

  // Build tree structure
  interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children: CategoryNode[];
  }

  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of allCategories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of allCategories) {
    const node = map.get(cat.id)!;
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  res.json(roots);
});
