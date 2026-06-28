import { useState, useEffect, useRef } from "react";
import type { NavGroup, NavItem } from "./types";
import { getArticleSlugFromHash, isHomeHash } from "./types";
import { getDocCategories, getDocArticles } from "./lib/content";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { RightSidebar } from "./components/layout/RightSidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { SiteFooter } from "./components/layout/SiteFooter";
import { PageRenderer } from "./components/PageRenderer";

export default function Docs() {
  const [loading, setLoading] = useState(true);
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);
  const [articleSlug, setArticleSlug] = useState<string | null>(() => {
    if (isHomeHash()) return null;
    return getArticleSlugFromHash();
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocCategories().then(async (cats) => {
      const groups: NavGroup[] = [];
      for (const cat of cats) {
        const articles = await getDocArticles(cat.id);
        if (articles.length > 0) {
          groups.push({
            label: cat.title,
            items: articles.map((a) => ({
              slug: `article/${a.slug}`,
              label: a.title,
            })),
          });
        }
      }
      setNavGroups(groups);
      setExpanded(Object.fromEntries(groups.map((g) => [g.label, true])));
      setLoading(false);
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

  const allItems = navGroups.flatMap((g) => g.items) as NavItem[];
  const currentArticle = articleSlug ? allItems.find((i) => i.slug === `article/${articleSlug}`) : null;
  const pageTitle = currentArticle?.label || "Docs";

  const filteredItems = searchQuery
    ? allItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const currentIndex = allItems.findIndex((i) => i.slug === `article/${articleSlug}`);
  const prev = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const next = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        page={articleSlug || "home"}
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
              {navGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.04]">
                    <svg className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white/50">Documentation is empty</h2>
                  <p className="mt-2 text-sm text-white/30 max-w-md">
                    No documentation articles have been published yet. Check back later or visit the admin panel to create content.
                  </p>
                </div>
              ) : (
                <>
                  {!articleSlug ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <h2 className="text-2xl font-bold text-white/60">Welcome to Tirbeo Docs</h2>
                      <p className="mt-2 text-sm text-white/30">Select an article from the sidebar to get started.</p>
                    </div>
                  ) : (
                    <PageRenderer articleSlug={articleSlug} />
                  )}
                </>
              )}
              {allItems.length > 0 && <BottomNav prev={prev} next={next} currentIndex={currentIndex} total={allItems.length} />}
              <SiteFooter />
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
