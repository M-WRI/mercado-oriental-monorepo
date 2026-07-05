export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function resolveUniqueCategorySlug(
  prisma: { category: { findFirst: (args: any) => Promise<{ id: string } | null> } },
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugifyCategoryName(name) || "category";
  let slug = base;
  let suffix = 2;

  while (
    await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }

  return slug;
}
