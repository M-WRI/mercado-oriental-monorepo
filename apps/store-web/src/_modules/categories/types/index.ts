export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
}

export interface FlatCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  depth: number;
}
