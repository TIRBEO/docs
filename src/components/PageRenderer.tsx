import { useState, useEffect } from "react";
import { getDocArticleBySlug, type DocArticle, type DocCategory } from "../lib/content";
import { renderMarkdown } from "../lib/markdown";
import { PageHeader } from "./ui/PageHeader";

export function PageRenderer({ articleSlug }: { articleSlug: string | null }) {
  const [article, setArticle] = useState<DocArticle | null>(null);
  const [category, setCategory] = useState<DocCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setArticle(null);
    setCategory(null);
    if (!articleSlug) { setLoading(false); return; }

    getDocArticleBySlug(articleSlug).then((result) => {
      if (result) {
        setArticle(result.article);
        setCategory(result.category);
      }
      setLoading(false);
    });
  }, [articleSlug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.06]" />
        <div className="h-4 w-full rounded bg-white/[0.04]" />
        <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
        <div className="h-4 w-5/6 rounded bg-white/[0.04]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
          <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white/60">No content yet</h3>
        <p className="mt-1 text-sm text-white/30">This documentation hasn't been written yet.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={article.title} category={category?.title ?? undefined} />
      <div className="prose-custom space-y-4">
        {renderMarkdown(article.content || "")}
      </div>
    </>
  );
}
