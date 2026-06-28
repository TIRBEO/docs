import { useState, useEffect, useRef } from "react";
import { getDocCategories, getDocArticles, type DocCategory, type DocArticle } from "./lib/content";
import type { NavGroup } from "./types";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { SiteFooter } from "./components/layout/SiteFooter";
import { RightSidebar } from "./components/layout/RightSidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { PageRenderer } from "./components/PageRenderer";
import { Glass, GlassPill } from "./components/ui/Glass";
import { Icon } from "./components/ui/Icon";

function getArticleSlugFromHash(): string | null {
  const hash = window.location.hash.replace("#", "");
  if (!hash || hash === "home") return null;
  return hash;
}

function HomePage({ categories, articlesByCategory }: {
  categories: DocCategory[];
  articlesByCategory: Record<string, DocArticle[]>;
}) {
  const firstArticle = categories.length > 0
    ? articlesByCategory[categories[0].id]?.[0]
    : null;

  return (
    <>
      <div className="mb-16">
        <GlassPill className="mb-4">Documentation</GlassPill>
        <h1 className="text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white">Connect. Create. Collaborate.</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/50">
          Everything you need to build, manage, and grow your community on Tirbeo.
        </p>
        {firstArticle && (
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`/#${firstArticle.slug}`}
              className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 active:scale-[0.97]"
            >Get Started<Icon name="arrow-right" className="h-4 w-4" /></a>
          </div>
        )}
      </div>
      {categories.map((cat) => (
        <div key={cat.id} className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30">{cat.title}</span>
          {cat.description && <p className="mt-1 text-sm text-white/40">{cat.description}</p>}
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {(articlesByCategory[cat.id] || []).map((article) => (
              <a key={article.id} href={`/#${article.slug}`} className="group block">
                <Glass className="p-5 transition-all duration-300 hover:bg-white/[0.06]">
                  <h3 className="text-base font-semibold text-white">{article.title}</h3>
                </Glass>
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function Docs() {
  const [articleSlug, setArticleSlug] = useState<string | null>(() => getArticleSlugFromHash());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [articlesByCategory, setArticlesByCategory] = useState<Record<string, DocArticle[]>>({});

  useEffect(() => {
    getDocCategories().then(async (cats) => {
      setCategories(cats);
      const byCat: Record<string, DocArticle[]> = {};
      const initExpanded: Record<string, boolean> = {};
      for (const cat of cats) {
        const articles = await getDocArticles(cat.id);
        byCat[cat.id] = articles;
        initExpanded[cat.title] = true;
      }
      setArticlesByCategory(byCat);
      setExpanded(initExpanded);
    });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setArticleSlug(getArticleSlugFromHash());
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchQuery("");
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isHome = articleSlug === null;

  const navGroups: NavGroup[] = categories.map((cat) => ({
    label: cat.title,
    items: (articlesByCategory[cat.id] || []).map((a) => ({
      slug: a.slug,
      label: a.title,
    })),
  }));

  const allItems = navGroups.flatMap((g) => g.items);
  const pageTitle = allItems.find((i) => i.slug === articleSlug)?.label || (isHome ? "Home" : "Docs");

  const currentArticle = allItems.find((i) => i.slug === articleSlug);
  const currentIndex = currentArticle ? allItems.indexOf(currentArticle) : -1;
  const prev = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const next = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  const filteredItems = searchQuery
    ? allItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        page={articleSlug || ""}
        expanded={expanded}
        onToggle={(label) => setExpanded((e) => ({ ...e, [label]: !e[label] }))}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredItems={filteredItems}
        searchRef={searchRef}
        groups={navGroups}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[280px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} pageTitle={pageTitle} />

        <div id="main-content" className="flex-1">
          <div className="mx-auto flex max-w-[88rem] gap-10 px-6 py-12 lg:px-10">
            <main className="min-w-0 flex-1 max-w-[54rem]">
              {isHome ? (
                <HomePage categories={categories} articlesByCategory={articlesByCategory} />
              ) : (
                <PageRenderer articleSlug={articleSlug} />
              )}
              {!isHome && (
                <BottomNav prev={prev} next={next} currentIndex={currentIndex} total={allItems.length} />
              )}
              <SiteFooter />
            </main>
            {!isHome && <RightSidebar />}
          </div>
        </div>
      </div>
    </div>
  );
}
