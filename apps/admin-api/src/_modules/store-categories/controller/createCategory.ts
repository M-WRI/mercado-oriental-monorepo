import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { resolveUniqueCategorySlug } from "../../../lib/categorySlug";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { assertValidCategoryParent } from "../lib/categoryTree";

export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, parentId, slug: slugInput } = req.body as {
    name?: string;
    parentId?: string | null;
    slug?: string;
  };

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError({
      case: "category_name",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const normalizedParentId = parentId ?? null;
  await assertValidCategoryParent(undefined, normalizedParentId);

  const slug =
    typeof slugInput === "string" && slugInput.trim()
      ? await resolveUniqueCategorySlug(prisma, slugInput.trim())
      : await resolveUniqueCategorySlug(prisma, name.trim());

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      parentId: normalizedParentId,
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

  res.status(201).json(category);
});
