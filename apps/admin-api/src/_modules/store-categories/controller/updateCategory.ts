import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { resolveUniqueCategorySlug } from "../../../lib/categorySlug";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { assertValidCategoryParent } from "../lib/categoryTree";

export const updateCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, parentId, slug: slugInput } = req.body as {
    name?: string;
    parentId?: string | null;
    slug?: string;
  };

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  });

  if (!existing) {
    throw new AppError({
      case: "category",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    throw new AppError({
      case: "category_name",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (parentId !== undefined) {
    await assertValidCategoryParent(id, parentId);
  }

  let slug: string | undefined;
  if (typeof slugInput === "string" && slugInput.trim()) {
    slug = await resolveUniqueCategorySlug(prisma, slugInput.trim(), id);
  } else if (name !== undefined) {
    slug = await resolveUniqueCategorySlug(prisma, name.trim(), id);
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name?.trim(),
      slug,
      parentId: parentId === undefined ? undefined : parentId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(category);
});
