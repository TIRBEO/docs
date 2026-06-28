import { supabase } from "./supabase";

export interface DocCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface DocArticle {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  content: string | null;
  sort_order: number;
  is_published: boolean;
}

export async function getDocCategories(): Promise<DocCategory[]> {
  const { data } = await supabase
    .from("doc_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as DocCategory[]) || [];
}

export async function getDocArticles(categoryId?: string): Promise<DocArticle[]> {
  let query = supabase
    .from("doc_articles")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  return (data as DocArticle[]) || [];
}

export async function getDocArticleBySlug(articleSlug: string): Promise<{ article: DocArticle; category: DocCategory } | null> {
  const { data: article } = await supabase
    .from("doc_articles")
    .select("*")
    .eq("slug", articleSlug)
    .eq("is_published", true)
    .single();
  if (!article) return null;
  const { data: cat } = await supabase
    .from("doc_categories")
    .select("*")
    .eq("id", article.category_id)
    .single();
  return { article: article as DocArticle, category: cat as DocCategory };
}

export async function getDocArticle(categorySlug: string, articleSlug: string): Promise<DocArticle | null> {
  const { data: cat } = await supabase
    .from("doc_categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();
  if (!cat) return null;
  const { data } = await supabase
    .from("doc_articles")
    .select("*")
    .eq("category_id", cat.id)
    .eq("slug", articleSlug)
    .eq("is_published", true)
    .single();
  return data as DocArticle | null;
}
