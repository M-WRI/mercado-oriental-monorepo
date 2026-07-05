export interface ICategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: ICategory[];
}

export interface ICategoryFlat {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}
