import { useState, useEffect, useRef } from "react";
import { getDocCategories, getDocArticles, getDocArticle } from "./lib/content";
import { renderMarkdown } from "./lib/markdown";

type Page =
  | "home" | "getting-started"
  | "about" | "team" | "careers" | "openings" | "benefits"
  | "press" | "press-kit" | "news" | "mentions"
  | "brand" | "logo" | "guidelines"
  | "legal" | "pp" | "tos" | "security" | "compliance"
  | "blog" | "faq" | "community" | "contact";

function getPageFromHash(): Page {
  const hash = window.location.hash.replace("#", "");
  const map: Record<string, Page> = {
    "": "home", home: "home", "getting-started": "getting-started",
    about: "about", team: "team", careers: "careers", openings: "openings", benefits: "benefits",
    press: "press", "press-kit": "press-kit", news: "news", mentions: "mentions",
    brand: "brand", logo: "logo", guidelines: "guidelines",
    legal: "legal", pp: "pp", tos: "tos", security: "security", compliance: "compliance",

    blog: "blog", faq: "faq", community: "community", contact: "contact",
  };
  return map[hash] || "home";
}

interface NavItem { page: Page; label: string; }
interface NavGroup { label: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  { label: "Getting Started", items: [{ page: "getting-started", label: "Getting Started" }] },
  { label: "Tirbeo", items: [
    { page: "about", label: "About Tirbeo" },
    { page: "team", label: "Team" },
    { page: "careers", label: "Careers" },
  ]},

  { label: "Resources", items: [
    { page: "blog", label: "Blog" },
    { page: "faq", label: "FAQ" },
    { page: "community", label: "Community" },
    { page: "contact", label: "Contact" },
  ]},
  { label: "Company", items: [
    { page: "press", label: "Press" }, { page: "brand", label: "Brand" },
    { page: "legal", label: "Legal" },
  ]},
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const PAGE_DESCRIPTIONS: Record<Page, string> = {
  home: "Tirbeo documentation and company handbook.",
  "getting-started": "Set up your profile, join communities, and learn the basics.",
  about: "Tirbeo is the parent company behind a suite of professional community workspace products.",
  team: "Meet the people behind Tirbeo.",
  careers: "Join us in building the future of community software.",
  openings: "View open roles across the company.",
  benefits: "Compensation, perks, and what we offer our team.",
  press: "Press releases, media kit, and brand resources.",
  news: "Latest company news and announcements.",
  mentions: "Tirbeo in the press and media.",
  "press-kit": "Download logos, screenshots, and brand assets.",
  brand: "Our brand identity and visual guidelines.",
  logo: "Logo downloads and usage specifications.",
  guidelines: "Brand usage guidelines and best practices.",
  legal: "Legal information, policies, and compliance.",
  pp: "How we handle your data and privacy.",
  tos: "Rules and guidelines for using Tirbeo.",
  security: "Our security practices and infrastructure.",
  compliance: "Certifications, standards, and regulatory compliance.",

  blog: "Product updates, stories, and company news.",
  faq: "Frequently asked questions.",
  community: "Join the Tirbeo community.",
  contact: "Get in touch with the team.",
};

/* ───── ICONS ───── */
const ICONS: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  "chevron-right": "M9 5l7 7-7 7",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 18L18 6M6 6l12 12",
  "arrow-left": "M19 12H5m7 7l-7-7 7-7",
  "arrow-right": "M5 12h14m-7-7l7 7-7 7",
  "external-link": "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14",
  github: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "check-circle": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "alert-triangle": "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  copy: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  target: "M12 2a10 10 0 1010 10M12 2a10 10 0 0110 10M12 2v10m0 0l6 6",
  globe: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  thumbsUp: "M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a1 1 0 01-1-1v-9a1 1 0 011-1h3",
  thumbsDown: "M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h3a1 1 0 011 1v9a1 1 0 01-1 1h-3",
  twitter: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
  linkedin: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",
  discord: "M15.73 3H8.27a2 2 0 00-1.73 1l-4.5 7.79a2 2 0 000 2l4.5 7.79a2 2 0 001.73 1h7.46a2 2 0 001.73-1l4.5-7.79a2 2 0 000-2l-4.5-7.79a2 2 0 00-1.73-1zM12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const p = ICONS[name];
  if (!p) return null;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {name === "github" ? <path d={p} fill="currentColor" stroke="none" /> : <path d={p} />}
    </svg>
  );
}

/* ───── GLASS COMPONENTS ───── */
function Glass({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-2xl ${className}`} {...props}>{children}</div>;
}

function GlassPill({ className = "", children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/60 backdrop-blur-2xl ${className}`} {...props}>{children}</span>;
}

function GlassButton({ className = "", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const Tag = props.href !== undefined ? "a" : "button";
  return <Tag className={`inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-sm text-white/50 backdrop-blur-2xl transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white active:scale-[0.97] ${className}`} {...(props as any)}>{children}</Tag>;
}

function GlassCard({ title, description, className = "" }: { title: string; description: string; className?: string }) {
  return (
    <Glass className={`group p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06] ${className}`}>
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{description}</p>
    </Glass>
  );
}

function GlassTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] bg-white/[0.04]">
            {headers.map((h) => <th key={h} className="px-4 py-3 text-left font-semibold text-white/70">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04] bg-white/[0.01] transition-colors hover:bg-white/[0.04]">
              {row.map((cell, j) => <td key={j} className="px-4 py-3 text-white/50">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return <kbd className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-white/60 backdrop-blur-2xl">{children}</kbd>;
}

function Callout({ variant, className = "", children }: { variant: "info" | "warning" | "success" | "danger"; className?: string; children: React.ReactNode }) {
  const borders = { info: "border-l-white/30", warning: "border-l-white/40", success: "border-l-white/40", danger: "border-l-white/50" };
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-white/[0.07] border-l-4 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/60 backdrop-blur-2xl ${borders[variant]} ${className}`}>
      <Icon name={variant === "info" ? "info" : "alert-triangle"} className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
      <div>{children}</div>
    </div>
  );
}

function TOC({ items }: { items: { id: string; label: string }[] }) {
  return (
    <Glass className="mb-8 p-4">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Sections</span>
      <ol className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
              <span className="h-1 w-1 rounded-full bg-white/30" />{item.label}
            </a>
          </li>
        ))}
      </ol>
    </Glass>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 id={id} className="group mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight text-white">
        <a href={`#${id}`} className="after:ml-2 after:text-white/30 after:opacity-0 after:transition-opacity after:content-['#'] hover:after:opacity-100">{title}</a>
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-white/50">{children}</div>
    </section>
  );
}

function StepCard({ number, title, children }: { number: number; title: string; children?: React.ReactNode }) {
  return (
    <Glass className="flex items-start gap-4 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-sm font-bold text-white/80">{number}</span>
      <div className="flex-1">
        <h4 className="mb-1 text-sm font-semibold text-white">{title}</h4>
        <div className="text-sm leading-relaxed text-white/50">{children}</div>
      </div>
    </Glass>
  );
}

function PageHeader({ page: pg, children }: { page: Page; children?: React.ReactNode }) {
  const label = ALL_NAV_ITEMS.find((i) => i.page === pg)?.label || pg;
  return (
    <div className="mb-10">
      <GlassPill className="mb-3">{pg === "home" ? "Documentation" : pg.replace("-", " ")}</GlassPill>
      <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight text-white">{label}</h1>
      <p className="mt-2 text-lg text-white/50">{PAGE_DESCRIPTIONS[pg]}</p>
      {children}
    </div>
  );
}

/* ───── LAYOUT COMPONENTS ───── */

function SidebarNavItem({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <a href={`/#${item.page}`} onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
        active
          ? "border-l-[3px] border-white bg-white/[0.06] pl-[calc(0.75rem-3px)] font-medium text-white"
          : "border-l-[3px] border-transparent pl-3 text-white/40 hover:bg-white/[0.04] hover:text-white/70"
      }`}
    >
      {item.label}
    </a>
  );
}

function SidebarGroup({ group, expanded, onToggle, activePage, onItemClick }: {
  group: NavGroup; expanded: boolean; onToggle: () => void; activePage: Page; onItemClick: () => void;
}) {
  return (
    <div className="mb-1">
      <button onClick={onToggle}
        className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white"
      >
        <Icon name="chevron-right" className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        {group.label}
      </button>
      {expanded && (
        <div className="mt-0.5 space-y-px">
          {group.items.map((item) => (
            <SidebarNavItem key={item.page} item={item} active={activePage === item.page} onClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({
  open, onClose, page, expanded, onToggle, searchQuery, onSearchChange, filteredItems, searchRef, groups,
}: {
  open: boolean; onClose: () => void; page: Page;
  expanded: Record<string, boolean>; onToggle: (label: string) => void;
  searchQuery: string; onSearchChange: (q: string) => void;
  filteredItems: NavItem[]; searchRef: React.RefObject<HTMLDivElement | null>;
  groups: NavGroup[];
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/[0.07] bg-black backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">T</span>
        <span className="font-semibold tracking-tight text-white">Tirbeo</span>
        <GlassPill>Docs</GlassPill>
        <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white lg:hidden">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>

      <div ref={searchRef} className="relative px-4 py-3">
        <Icon name="search" className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text" placeholder="Search..." value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2 pl-9 pr-10 text-sm text-white placeholder:text-white/20 backdrop-blur-2xl focus:border-white/20 focus:bg-white/[0.06] focus:outline-none"
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-white/30">⌘K</span>
        {searchQuery && filteredItems.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 overflow-hidden rounded-xl border border-white/[0.07] bg-black backdrop-blur-2xl">
            {filteredItems.map((item) => (
              <a key={item.page} href={`/#${item.page}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
              >{item.label}</a>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10" aria-label="Main">
        {groups.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            expanded={group.label ? expanded[group.label] : true}
            onToggle={() => group.label && onToggle(group.label)}
            activePage={page}
            onItemClick={onClose}
          />
        ))}
      </nav>

      <div className="border-t border-white/[0.07] px-3 py-3">
        <a href="https://github.com/TIRBEO" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/40 transition-all hover:bg-white/[0.04] hover:text-white/70"
        >
          <Icon name="github" className="h-4 w-4" />
          <span className="flex-1">TIRBEO on GitHub</span>
          <Icon name="external-link" className="h-3 w-3 text-white/20" />
        </a>
      </div>
    </aside>
  );
}

function TopBar({ onMenuClick, pageTitle: forcedTitle }: { onMenuClick: () => void; page?: Page; pageTitle?: string }) {
  const pageTitle = forcedTitle || "Docs";
  return (
    <div className="sticky top-0 z-20 border-b border-white/[0.07] bg-black/80 backdrop-blur-3xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-white/40 backdrop-blur-2xl transition-colors hover:border-white/20 hover:text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" className="h-4 w-4" />
        </button>
        <nav className="hidden items-center gap-1.5 text-sm text-white/40 sm:flex">
          <a href="/#home" className="transition-colors hover:text-white">Home</a>
          <Icon name="chevron-right" className="h-3 w-3 text-white/20" />
          <span className="font-medium text-white">{pageTitle}</span>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <GlassButton href="https://github.com/TIRBEO/docs" target="_blank" rel="noopener noreferrer">
            <Icon name="edit" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

function RightSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 xl:block">
      <div className="sticky top-[73px] space-y-4">
        <Glass className="p-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
            <Icon name="book" className="h-3.5 w-3.5" />On this page
          </span>
          <nav className="mt-3 space-y-1.5 text-sm">
            <a href="#overview" className="flex items-center gap-2 text-white/50 transition-colors hover:text-white">
              <span className="h-1 w-1 rounded-full bg-white/40" />Overview
            </a>
            <a href="#features" className="flex items-center gap-2 pl-3 text-white/40 transition-colors hover:text-white/70">Features</a>
            <a href="#guide" className="flex items-center gap-2 pl-3 text-white/40 transition-colors hover:text-white/70">Guide</a>
          </nav>
        </Glass>
        <Glass className="p-4">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Helpful?</span>
          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs text-white/40 backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95">
              <Icon name="thumbsUp" className="h-3.5 w-3.5" />Yes
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs text-white/40 backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95">
              <Icon name="thumbsDown" className="h-3.5 w-3.5" />No
            </button>
          </div>
        </Glass>
        <GlassButton href="https://github.com/TIRBEO/docs" target="_blank" rel="noopener noreferrer" className="w-full justify-center">
          <Icon name="github" className="h-4 w-4" />Edit on GitHub
        </GlassButton>
      </div>
    </aside>
  );
}

function BottomNav({ prev, next, currentIndex, total }: { prev: NavItem | null; next: NavItem | null; currentIndex: number; total: number }) {
  return (
    <div className="mt-16 flex items-center gap-4 border-t border-white/[0.07] pt-8">
      {prev ? (
        <a href={`/#${prev.page}`}
          className="group flex flex-1 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-5 py-3.5 backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/[0.08]"
        >
          <Icon name="arrow-left" className="h-4 w-4 text-white/30 transition-colors group-hover:text-white" />
          <div className="flex-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">Previous</span>
            <p className="text-sm text-white/60 group-hover:text-white">{prev.label}</p>
          </div>
        </a>
      ) : <div className="flex-1" />}
      <span className="text-xs text-white/30">{currentIndex + 1} of {total}</span>
      {next ? (
        <a href={`/#${next.page}`}
          className="group flex flex-1 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-5 py-3.5 backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/[0.08]"
        >
          <div className="flex-1 text-right">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">Next</span>
            <p className="text-sm text-white/60 group-hover:text-white">{next.label}</p>
          </div>
          <Icon name="arrow-right" className="h-4 w-4 text-white/30 transition-colors group-hover:text-white" />
        </a>
      ) : <div className="flex-1" />}
    </div>
  );
}

/* ───── DOCS DB MAPPING ───── */

const pageToDocSlug: Record<string, { categorySlug: string; articleSlug: string } | null> = {
  about: { categorySlug: "company", articleSlug: "about" },
  team: { categorySlug: "company", articleSlug: "team" },
  careers: { categorySlug: "company", articleSlug: "careers" },
  openings: { categorySlug: "company", articleSlug: "openings" },
  benefits: { categorySlug: "company", articleSlug: "benefits" },
  press: { categorySlug: "company", articleSlug: "press" },
  "press-kit": { categorySlug: "company", articleSlug: "press-kit" },
  news: { categorySlug: "company", articleSlug: "news" },
  mentions: { categorySlug: "company", articleSlug: "mentions" },
  brand: { categorySlug: "brand", articleSlug: "brand" },
  logo: { categorySlug: "brand", articleSlug: "logo" },
  guidelines: { categorySlug: "brand", articleSlug: "guidelines" },
  legal: { categorySlug: "legal", articleSlug: "legal" },
  pp: { categorySlug: "legal", articleSlug: "privacy" },
  tos: { categorySlug: "legal", articleSlug: "terms" },
  security: { categorySlug: "legal", articleSlug: "security" },
  compliance: { categorySlug: "legal", articleSlug: "compliance" },

  "getting-started": { categorySlug: "getting-started", articleSlug: "overview" },
  blog: null,
  faq: null,
  community: null,
  contact: null,
};

/* ───── PAGES ───── */

function PageRenderer({ page }: { page: Page }) {
  const [dbContent, setDbContent] = useState<React.ReactNode | null>(null);
  const [dbChecked, setDbChecked] = useState(false);

  useEffect(() => {
    const mapping = pageToDocSlug[page];
    if (!mapping) { setDbChecked(true); return; }
    getDocArticle(mapping.categorySlug, mapping.articleSlug).then((a) => {
      if (a?.content) {
        setDbContent(
          <>
            <PageHeader page={page} />
            <div className="prose-custom space-y-4">
              {renderMarkdown(a.content)}
            </div>
          </>
        );
      }
      setDbChecked(true);
    });
  }, [page]);

  if (!dbChecked) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-white/[0.06]" /><div className="h-4 w-full rounded bg-white/[0.04]" /><div className="h-4 w-3/4 rounded bg-white/[0.04]" /><div className="h-4 w-5/6 rounded bg-white/[0.04]" /></div>;
  }

  if (dbContent) return dbContent;

  const pages: Record<Page, () => React.ReactNode> = {
    home: HomePage, "getting-started": GettingStarted,
    about: AboutPage, team: TeamPage, careers: CareersPage,
    openings: OpeningsPage, benefits: BenefitsPage,
    press: PressPage, news: NewsPage, mentions: MentionsPage, "press-kit": PressKitPage,
    brand: BrandPage, logo: LogoPage, guidelines: GuidelinesPage,
    legal: LegalPage, pp: PrivacyPolicy, tos: TermsOfService,
    security: SecurityPage, compliance: CompliancePage,

    blog: BlogPage, faq: FAQPage, community: CommunityPage, contact: ContactPage,
  };
  const fn = pages[page] || HomePage;
  return fn();
}

/* ───── MAIN APP ───── */
export default function Docs() {
  const [page, setPage] = useState<Page>(getPageFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => { if (g.label) init[g.label] = true; });
    return init;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHashChange = () => {
      setPage(getPageFromHash());
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

  /* ─── DB-driven nav enrichment ─── */
  const [dbNavGroups, setDbNavGroups] = useState<{ label: string; items: NavItem[] }[]>([]);
  useEffect(() => {
    getDocCategories().then(async (cats) => {
      if (cats.length === 0) return;
      const groups: { label: string; items: NavItem[] }[] = [];
      for (const cat of cats) {
        const articles = await getDocArticles(cat.id);
        if (articles.length > 0) {
          groups.push({
            label: cat.title,
            items: articles.map((a) => ({
              page: `${cat.slug}-${a.slug}` as Page,
              label: a.title,
            })),
          });
        }
      }
      if (groups.length > 0) setDbNavGroups(groups);
    });
  }, []);

  const allGroups = [...dbNavGroups, ...NAV_GROUPS];
  const allItems = allGroups.flatMap((g) => g.items);
  const pageTitle = allItems.find((i) => i.page === page)?.label || "Docs";

  const filteredItems = searchQuery
    ? allItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const currentIndex = allItems.findIndex((i) => i.page === page);
  const prev = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const next = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        page={page}
        expanded={expanded}
        onToggle={(label) => setExpanded((e) => ({ ...e, [label]: !e[label] }))}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredItems={filteredItems}
        searchRef={searchRef}
        groups={allGroups}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[280px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} pageTitle={pageTitle} />

        <div id="main-content" className="flex-1">
          <div className="mx-auto flex max-w-[88rem] gap-10 px-6 py-12 lg:px-10">
            <main className="min-w-0 flex-1 max-w-[54rem]">
              <PageRenderer page={page} />
              <BottomNav prev={prev} next={next} currentIndex={currentIndex} total={allItems.length} />
              <SiteFooter />
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-8 py-6 backdrop-blur-2xl">
      <div className="flex flex-col items-start gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-white/30">&copy; {new Date().getFullYear()} Tirbeo. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="/#pp" className="text-white/40 transition-colors hover:text-white">Privacy</a>
          <a href="/#tos" className="text-white/40 transition-colors hover:text-white">Terms</a>
          <a href="/#legal" className="text-white/40 transition-colors hover:text-white">Legal</a>
          <a href="/#contact" className="text-white/40 transition-colors hover:text-white">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          {[["twitter", "https://twitter.com/tirbeo"], ["github", "https://github.com/TIRBEO"], ["discord", "https://discord.gg/tirbeo"], ["linkedin", "https://linkedin.com/company/tirbeo"]].map(([icon, url]) => (
            <a key={icon} href={url} target="_blank" rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-white/40 backdrop-blur-2xl transition-all hover:border-white/20 hover:text-white"
            ><Icon name={icon} className="h-4 w-4" /></a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────── PAGE CONTENT ──────────────────────── */

function HomePage() {
  return (
    <>
      <div className="mb-16">
        <GlassPill className="mb-4">Documentation v2.0</GlassPill>
        <h1 className="text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white">Connect. Create. <br />Collaborate.</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/50">
          Everything you need to build, manage, and grow your community on Tirbeo.
          Explore our company handbook and product documentation.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/#getting-started"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 active:scale-[0.97]"
          >Get Started<Icon name="arrow-right" className="h-4 w-4" /></a>
          <GlassButton href="https://github.com/TIRBEO" target="_blank" rel="noopener noreferrer">
            <Icon name="github" className="h-4 w-4" />View on GitHub
          </GlassButton>
        </div>
      </div>
      <SectionGroup title="Tirbeo — The Parent Company" items={[
        ["About Tirbeo", "Our mission, goal, spirit, vision, and product suite."],
        ["Team", "Meet the people building the future of community workspaces."],
        ["Careers", "Join us in building the future of community software."],
      ]} />
      <SectionGroup title="Tirbeo Chat — Product Docs" items={[
        ["Overview", "Real-time messaging for professional communities."],
        ["Getting Started", "Access chat, select channels, and send your first message."],
        ["Channels", "Text, voice, announcement, and locked channels."],
        ["Messaging", "Rich text, code blocks, file uploads, and message actions."],
      ]} />
      <SectionGroup title="Resources" items={[
        ["Blog", "Product updates, company news, and community stories."],
        ["FAQ", "Frequently asked questions about Tirbeo."],
        ["Community", "Join the Tirbeo community on Discord, GitHub, and more."],
        ["Contact", "Get in touch with the team."],
      ]} />
    </>
  );
}

function SectionGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="mb-10">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30">{title}</span>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {items.map(([t, d]) => <GlassCard key={t} title={t} description={d} />)}
      </div>
    </div>
  );
}

function GettingStarted() {
  const toc = [
    { id: "creating-account", label: "Creating an Account" },
    { id: "joining-a-community", label: "Joining a Community" },
    { id: "profile-setup", label: "Profile Setup" },
    { id: "navigating-the-workspace", label: "Navigating the Workspace" },
    { id: "keyboard-shortcuts", label: "Keyboard Shortcuts" },
  ];
  return (<><PageHeader page="getting-started" /><TOC items={toc} />
    <Section id="creating-account" title="Creating an Account">
      <StepCard number={1} title="Visit the sign-up page">Navigate to the Tirbeo sign-up page and enter your email address.</StepCard>
      <StepCard number={2} title="Choose your username">Pick a unique username and set a strong password.</StepCard>
      <StepCard number={3} title="Verify your email">Click the verification link sent to your email to activate your account.</StepCard>
      <Callout variant="info">Use your professional email for community-managed workspaces.</Callout>
    </Section>
    <Section id="joining-a-community" title="Joining a Community">
      <p>Communities can be public or invite-only. Browse the directory for public spaces or ask for an invite link.</p>
    </Section>
    <Section id="profile-setup" title="Profile Setup">
      <p>Add a display name, avatar, bio, and links. Set timezone and notification preferences from the settings panel.</p>
    </Section>
    <Section id="navigating-the-workspace" title="Navigating the Workspace">
      <p>The interface has three areas: sidebar, main content, and member list. Press <Kbd>⌘K</Kbd> to search everything.</p>
    </Section>
    <Section id="keyboard-shortcuts" title="Keyboard Shortcuts">
      <div className="space-y-2">{["⌘K:Command palette", "⌘N:New message", "⌘B:Toggle sidebar", "⌘,:Settings", "⌘F:Search channel"].map((s => { const [k, d] = s.split(":"); return <div key={k} className="flex items-center gap-3 text-sm"><Kbd>{k}</Kbd><span className="text-white/50">{d}</span></div>; }))}</div>
    </Section>
  </>);
}

/* ───── COMPANY: ABOUT TIRBEO ───── */
function AboutPage() {
  const toc = [
    { id: "overview", label: "About Tirbeo" },
    { id: "goal", label: "Our Goal" },
    { id: "spirit", label: "Our Spirit" },
    { id: "vision", label: "Our Vision" },
    { id: "products", label: "Our Products" },
    { id: "why", label: "Why Tirbeo" },
    { id: "who", label: "Who It's For" },
    { id: "metrics", label: "Key Metrics" },
    { id: "comparison", label: "Platform Comparison" },
    { id: "links", label: "Company Links" },
    { id: "rules", label: "Community Rules" },
  ];
  return (<><PageHeader page="about" /><TOC items={toc} />

    <Section id="overview" title="About Tirbeo">
      <p>Tirbeo is the parent company behind a suite of professional community workspace products. We build tools that help communities learn, collaborate, and build together — in spaces that feel as polished as the products they create.</p>
      <p className="mt-4">Today's collaboration tools fall into two camps: consumer chat platforms that feel too casual for professional communities, and enterprise tools that are too rigid for organic collaboration. Tirbeo bridges this gap.</p>
      <p className="mt-4">Our mission is to create a family of products that give communities structured spaces for real-time chat, threaded discussions, resource libraries, project management, events, and wikis — all in a cohesive, premium workspace environment.</p>
    </Section>

    <Section id="goal" title="Our Goal">
      <p className="text-xl font-semibold leading-relaxed text-white">"To empower communities to learn, build, and grow together — in a space that feels as professional as the work they create."</p>
      <p className="mt-4">We believe that great communities deserve great tools. Tools that don't force them to choose between "casual and fun" or "professional and rigid." Tools that respect their time, their work, and their goals.</p>
    </Section>

    <Section id="spirit" title="Our Spirit">
      <GlassTable headers={["Value", "Description"]} rows={[
        ["Clarity", "Everything should be obvious, intuitive, and beautifully designed"],
        ["Community First", "We build for communities, not corporations"],
        ["Craftsmanship", "Quality in every pixel, every interaction, every line of code"],
        ["Openness", "Transparent, inclusive, and welcoming to all"],
        ["Innovation", "Always pushing forward, never settling"],
      ]} />
    </Section>

    <Section id="vision" title="Our Vision">
      <p>A world where every community — whether developers, designers, educators, startups, or DAOs — has a beautiful, integrated workspace to collaborate, share knowledge, and build amazing things together.</p>
    </Section>

    <Section id="products" title="Our Products">
      <p>Tirbeo offers a suite of products designed for different community needs:</p>
     <div className="mt-4">
  <GlassTable
    headers={["Platform", "Everything Included", "Status"]}
    rows={[
      [
        "Tirbeo Chat",
        "Real-time messaging, channels, threads, voice & video calls, discussions, resources, project management, events, collaborative wiki, and identity management—all in one unified workspace.",
        "Live",
      ],
    ]}
  />
</div>
    </Section>

    <Section id="why" title="Why Tirbeo">
      <GlassTable headers={["Problem", "Tirbeo Solution"]} rows={[
        ["Discord feels too casual for professional work", "Professional UI with no gamer aesthetic"],
        ["Slack is designed for companies, not communities", "Community-centric with easy discovery and joining"],
        ["Reddit lacks real-time collaboration", "Real-time chat, events, and project spaces alongside discussions"],
        ["Notion is great for docs but lacks social interaction", "Live, interactive communities built around knowledge"],
        ["Circle.so lacks depth in projects and resources", "Full project management, resource libraries, and wikis"],
      ]} />
    </Section>

    <Section id="who" title="Who Is Tirbeo For?">
      <GlassTable headers={["Segment", "Description", "Primary Use Cases"]} rows={[
        ["Developers", "Software engineers and open source contributors", "OSS collaboration, code reviews, hackathons"],
        ["Designers", "UX/UI designers and creative professionals", "Feedback rounds, resource sharing, critiques"],
        ["Educators", "Bootcamp instructors and course creators", "Student communities, cohort management"],
        ["Startups", "Early-stage teams and indie builders", "Async updates, investor relations, hiring"],
        ["DAOs / Communities", "Web3 and grassroots organizations", "Governance discussions, event coordination"],
      ]} />
    </Section>

    <Section id="metrics" title="Key Metrics">
      <GlassTable headers={["Metric", "Target (12 months post-launch)"]} rows={[
        ["Registered users", "100,000+"],
        ["Active communities", "5,000+"],
        ["Monthly active users (MAU)", "40% of registered"],
        ["Community retention (30-day)", "> 60%"],
        ["Average session duration", "> 8 minutes"],
        ["Mobile traffic share", "> 40%"],
      ]} />
    </Section>

    <Section id="comparison" title="Platform Comparison">
      <GlassTable headers={["Feature", "Tirbeo", "Discord", "Slack", "Reddit", "Notion", "Circle.so"]} rows={[
        ["Professional UI", "Yes", "No", "Yes", "No", "Yes", "Yes"],
        ["Community-Centric", "Yes", "Yes", "No", "Yes", "No", "Yes"],
        ["Real-Time Chat", "Yes", "Yes", "Yes", "No", "No", "Yes"],
        ["Threaded Discussions", "Yes", "No", "Yes", "Yes", "No", "Yes"],
        ["Resource Library", "Yes", "No", "No", "No", "Yes", "No"],
        ["Project Management", "Yes", "No", "No", "No", "Yes", "No"],
        ["Events & RSVP", "Yes", "No", "No", "No", "No", "Yes"],
        ["Wiki / Knowledge Base", "Yes", "No", "No", "No", "Yes", "No"],
        ["Member Profiles", "Yes", "Yes", "Yes", "Yes", "No", "Yes"],
        ["Dark / Light Mode", "Yes", "Yes", "Yes", "No", "Yes", "Yes"],
      ]} />
    </Section>

    <Section id="links" title="Company Links">
      <GlassTable headers={["Link", "URL"]} rows={[
        ["Website", "tirbeo.com"],
        ["Documentation", "docs.tirbeo.com"],
        ["Status", "status.tirbeo.com"],
        ["Blog", "blog.tirbeo.com"],
        ["Changelog", "changelog.tirbeo.com"],
        ["Twitter/X", "@tirbeo"],
        ["GitHub", "github.com/tirbeo"],
        ["LinkedIn", "linkedin.com/company/tirbeo"],
        ["YouTube", "youtube.com/@tirbeo"],
      ]} />
    </Section>

    <Section id="rules" title="Community Rules">
      <div className="space-y-3">
        {[["1. Be Respectful", "Treat all members with respect. Harassment, bullying, and discrimination will not be tolerated."],
          ["2. Stay On Topic", "Keep conversations relevant to the community's purpose and channel topics."],
          ["3. No Spam", "Do not post unsolicited promotional content or repetitive messages."],
          ["4. Protect Privacy", "Do not share personal information of other members without consent."],
          ["5. No Illegal Content", "Do not share illegal content, copyrighted material, or harmful links."],
          ["6. Be Constructive", "Provide helpful, constructive feedback. Criticism should be respectful and actionable."],
          ["7. Follow Channel Guidelines", "Each channel may have specific rules — read and follow them."],
          ["8. Report Issues", "Use the report feature to flag inappropriate content. Do not engage publicly."],
          ["9. No Impersonation", "Do not impersonate other members, staff, or public figures."],
          ["10. Have Fun", "Communities are built on positive interactions. Contribute, learn, and enjoy!"],
        ].map(([t, d]) => <Glass key={t} className="p-4 transition-all duration-300 hover:border-white/20"><h3 className="text-sm font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-white/50">{d}</p></Glass>)}
      </div>
    </Section>
  </>);
}

/* ───── COMPANY: TEAM ───── */
function TeamPage() {
  return (<><PageHeader page="team" />
    <Section id="leadership" title="Team">
      <div className="grid gap-4 sm:grid-cols-2">
        {[["Alex Chen", "CEO & Co-Founder", "Former engineering lead at Figma. Passionate about community building."],
          ["Sarah Kim", "CTO & Co-Founder", "Ex-Google engineer. Expert in real-time systems and distributed architecture."],
          ["Marcus Johnson", "Head of Design", "Previously at Linear. Believes in beautiful, functional design."],
          ["Priya Patel", "Head of Community", "Community builder with 10+ years of experience."],
          ["Tom Williams", "Lead Engineer", "Full-stack developer. Open source contributor."],
          ["Lisa Martinez", "Product Manager", "Focused on user experience and product-market fit."],
        ].map(([n, r, b]) => <Glass key={n} className="p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><h3 className="text-base font-semibold text-white">{n}</h3><p className="text-sm text-white/40">{r}</p><p className="mt-2 text-sm text-white/50">{b}</p></Glass>)}
      </div>
    </Section>
  </>);
}

/* ───── COMPANY: CAREERS ───── */
function CareersPage() {
  return (<><PageHeader page="careers" />
    <Section id="why-join" title="Join Our Team">
      <p>We're always looking for talented people who share our vision of building the future of community workspaces.</p>
      <p className="mt-2">Small team. Big impact. Own real problems, ship to real users.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/#openings" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90">View Open Positions <Icon name="arrow-right" className="h-4 w-4" /></a>
        <GlassButton href="mailto:careers@tirbeo.com">Send Resume</GlassButton>
      </div>
    </Section>
    <Section id="current-openings" title="Current Openings">
      <GlassTable headers={["Position", "Type", "Location"]} rows={[
        ["Senior Full-Stack Engineer", "Full-time", "Remote"],
        ["Product Designer", "Full-time", "Remote"],
        ["Community Manager", "Full-time", "Remote"],
        ["DevOps Engineer", "Full-time", "Remote"],
        ["Marketing Lead", "Full-time", "Remote"],
        ["Frontend Engineer", "Full-time", "Remote"],
      ]} />
      <div className="mt-4"><Callout variant="info">Send your resume and portfolio to: careers@tirbeo.com</Callout></div>
    </Section>
  </>);
}

function OpeningsPage() {
  return (<><PageHeader page="openings" />
    <Section id="roles" title="Open Roles">
      <div className="space-y-3">
        {[["Senior Full-Stack Engineer", "Full-time · Remote. Build core platform features."],
          ["Product Designer", "Full-time · Remote. Design calm, beautiful interfaces."],
          ["Community Manager", "Full-time · Remote. Help communities thrive."],
          ["DevOps Engineer", "Full-time · Remote. Scale platform, 99.9% uptime."],
          ["Marketing Lead", "Full-time · Remote. Drive growth and awareness."],
          ["Frontend Engineer", "Full-time · Remote. Build beautiful, responsive UIs."],
        ].map(([r, d]) => (
          <Glass key={r} className="group flex items-center justify-between p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
            <div><h3 className="text-base font-semibold text-white">{r}</h3><p className="text-sm text-white/50">{d}</p></div>
            <span className="flex items-center gap-1 text-sm font-medium text-white/60 opacity-0 transition-opacity group-hover:opacity-100">Apply <Icon name="arrow-right" className="h-3 w-3" /></span>
          </Glass>
        ))}
      </div>
      <div className="mt-4"><Callout variant="info">Send your resume and portfolio to: careers@tirbeo.com</Callout></div>
    </Section>
  </>);
}

function BenefitsPage() {
  return (<><PageHeader page="benefits" />
    <Section id="comp" title="Compensation & Perks">
      <div className="grid gap-4 sm:grid-cols-2">
        {[["Competitive Salary", "Top-tier compensation aligned with your experience."],
          ["Equity", "Meaningful equity grants in the company."],
          ["Unlimited PTO", "Minimum 3 weeks required. We actually take it."],
          ["Home Office", "$2,000 stipend for your workspace."],
          ["Health & Dental", "Comprehensive coverage for you and dependents."],
          ["Annual Retreat", "All-expenses-paid team gathering twice a year."],
        ].map(([t, d]) => <GlassCard key={t} title={t} description={d} />)}
      </div>
    </Section>
  </>);
}

/* ───── COMPANY: PRESS ───── */
function PressPage() {
  return (<><PageHeader page="press" />
    <div className="grid gap-4 sm:grid-cols-2">
      <a href="/#news" className="group"><Glass className="p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><Icon name="globe" className="mb-3 h-8 w-8 text-white/60" /><h3 className="text-lg font-semibold text-white">News</h3><p className="mt-1 text-sm text-white/50">Company announcements.</p></Glass></a>
      <a href="/#mentions" className="group"><Glass className="p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><Icon name="book" className="mb-3 h-8 w-8 text-white/60" /><h3 className="text-lg font-semibold text-white">Mentions</h3><p className="mt-1 text-sm text-white/50">In the press.</p></Glass></a>
      <a href="/#press-kit" className="group"><Glass className="p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><Icon name="image" className="mb-3 h-8 w-8 text-white/60" /><h3 className="text-lg font-semibold text-white">Press Kit</h3><p className="mt-1 text-sm text-white/50">Logos, screenshots, brand assets.</p></Glass></a>
    </div>
  </>);
}

function NewsPage() {
  return (<><PageHeader page="news" />
    <div className="space-y-3">
      {[["Tirbeo Raises $5M Seed Round", "Jun 2026 — Seed round led by XYZ Ventures."],
        ["Enterprise SSO Launch", "May 2026 — SAML, OIDC, and audit logging."],
        ["Community Insights", "Apr 2026 — Analytics dashboard for admins."],
        ["10K Communities", "Mar 2026 — A huge milestone."],
      ].map(([t, d]) => <Glass key={t} className="p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><h3 className="text-base font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-white/50">{d}</p></Glass>)}
    </div>
  </>);
}

function MentionsPage() {
  return (<><PageHeader page="mentions" />
    <div className="space-y-3">
      {[["TechCrunch", "Tirbeo is rethinking community software from the ground up.", "Jun 2026"],
        ["The Verge", "A calm, considered alternative to Discord and Slack.", "May 2026"],
        ["Product Hunt", "Product of the Day — May 2026.", "May 2026"],
      ].map(([s, q, d]) => <Glass key={s} className="p-5 transition-all duration-300 hover:border-white/20"><span className="text-xs font-semibold uppercase tracking-wider text-white/30">{s}</span><p className="mt-1 text-sm italic text-white/60">"{q}"</p><span className="mt-1 block text-xs text-white/30">{d}</span></Glass>)}
    </div>
  </>);
}

function PressKitPage() {
  return (<><PageHeader page="press-kit" />
    <Section id="assets" title="Brand Assets">
      <div className="grid gap-4 sm:grid-cols-2">
        {[["Tirbeo Logo", "T", "SVG · PNG · 256x256"], ["Wordmark", "tirbeo", "SVG · PNG"]].map(([t, l, f]) => (
          <Glass key={t} className="flex flex-col items-center justify-center p-6 min-h-[140px] transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black">{l === "T" ? "T" : null}</span>
            {l === "tirbeo" && <span className="text-2xl font-bold tracking-tight text-white">{l}</span>}
            <p className="mt-3 text-sm font-semibold text-white">{t}</p>
            <p className="text-xs text-white/30">{f}</p>
          </Glass>
        ))}
      </div>
    </Section>
  </>);
}

/* ───── COMPANY: BRAND ───── */
function BrandPage() {
  return (<><PageHeader page="brand" />
    <Section id="identity" title="Identity"><p>Our brand is built on clarity, calm, and confidence. Clean lines, generous whitespace, monochrome palette.</p></Section>
    <Section id="palette" title="Color Palette">
      <div className="grid grid-cols-4 gap-3">{["#000000", "#FFFFFF", "#1A1A1A", "#333333", "#666666", "#999999", "#CCCCCC"].map(h => <Glass key={h} className="p-3 text-center"><div className="mx-auto h-12 w-12 rounded-lg border border-white/10" style={{ background: h }} /><p className="mt-2 text-xs text-white/30">{h}</p></Glass>)}</div>
    </Section>
  </>);
}

function LogoPage() {
  return (<><PageHeader page="logo" />
    <Section id="downloads" title="Downloads">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Primary Logo", "Full color on transparent"], ["Icon Only", "The T mark"], ["Wordmark", "Tirbeo logotype"]].map(([t, d]) => (
          <Glass key={t} className="p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black mx-auto">T</span>
            <h3 className="mt-3 text-sm font-semibold text-white">{t}</h3>
            <p className="mt-1 text-xs text-white/50">{d}</p>
          </Glass>
        ))}
      </div>
    </Section>
  </>);
}

function GuidelinesPage() {
  return (<><PageHeader page="guidelines" />
    <Section id="usage" title="Usage"><p>Always use provided logo files. Don't modify, rotate, or add effects. Maintain clear space equal to logo height.</p><Callout variant="info">For questions: brand@tirbeo.com</Callout></Section>
    <Section id="donot" title="What Not to Do"><div className="space-y-3">{["Don't stretch or distort", "Don't change colors", "Don't add effects", "Don't rearrange elements"].map(t => <GlassCard key={t} title={t} description="Maintain brand integrity." />)}</div></Section>
  </>);
}

/* ───── COMPANY: LEGAL ───── */
function LegalPage() {
  return (<><PageHeader page="legal" />
    <div className="grid gap-4 sm:grid-cols-2">
      {[["/pp", "Privacy Policy", "How we handle your data."], ["/tos", "Terms of Service", "Rules for using Tirbeo."], ["/security", "Security", "Our security practices."], ["/compliance", "Compliance", "Certifications and standards."]].map(([href, t, d]) => (
        <a key={t} href={`/#${href.replace("/", "")}`} className="group"><Glass className="p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><h3 className="text-lg font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-white/50">{d}</p></Glass></a>
      ))}
    </div>
  </>);
}

function PrivacyPolicy() {
  const toc = [{ id: "pp-1", label: "Information We Collect" }, { id: "pp-2", label: "How We Use It" }, { id: "pp-3", label: "Storage" }, { id: "pp-4", label: "Your Rights" }];
  return (<><PageHeader page="pp" /><TOC items={toc} />
    <Section id="pp-1" title="Information We Collect"><p>Email, display name, avatar, and usage data to operate and improve the service.</p></Section>
    <Section id="pp-2" title="How We Use Your Information"><p>To provide and improve Tirbeo. We never sell your personal data.</p></Section>
    <Section id="pp-3" title="Data Storage"><p>Encrypted at rest and in transit. EU-based servers. Regular audits.</p></Section>
    <Section id="pp-4" title="Your Rights"><p>Access, correct, or delete your data anytime. Export from account settings.</p></Section>
  </>);
}

function TermsOfService() {
  const toc = [{ id: "tos-1", label: "Acceptance" }, { id: "tos-2", label: "Responsibility" }, { id: "tos-3", label: "Use" }, { id: "tos-4", label: "Ownership" }, { id: "tos-5", label: "Termination" }];
  return (<><PageHeader page="tos" /><TOC items={toc} />
    <Section id="tos-1" title="Acceptance"><p>By using Tirbeo, you agree to these terms.</p></Section>
    <Section id="tos-2" title="Account Responsibility"><p>You're responsible for your credentials and account activity.</p></Section>
    <Section id="tos-3" title="Acceptable Use"><p>No unlawful activity, harassment, malware, or IP infringement.</p></Section>
    <Section id="tos-4" title="Content Ownership"><p>You retain ownership. You grant Tirbeo a license to operate the service.</p></Section>
    <Section id="tos-5" title="Termination"><p>We may suspend for violations. You may delete your account anytime.</p></Section>
  </>);
}

function SecurityPage() {
  const toc = [{ id: "infrastructure", label: "Infrastructure" }, { id: "encryption", label: "Encryption" }];
  return (<><PageHeader page="security" /><TOC items={toc} />
    <Section id="infrastructure" title="Infrastructure"><p>AWS with SOC 2 compliance. US and EU data centers. 99.9% uptime SLA.</p></Section>
    <Section id="encryption" title="Encryption"><p>AES-256 at rest, TLS 1.3 in transit. E2E encryption for direct messages.</p></Section>
  </>);
}

function CompliancePage() {
  const toc = [{ id: "certifications", label: "Certifications" }, { id: "gdpr", label: "GDPR" }];
  return (<><PageHeader page="compliance" /><TOC items={toc} />
    <Section id="certifications" title="Certifications"><GlassTable headers={["Standard", "Status"]} rows={[["SOC 2 Type II", "In progress"], ["GDPR", "Compliant"], ["CCPA", "Compliant"]]} /></Section>
    <Section id="gdpr" title="GDPR"><p>GDPR compliant. DPA available for EU customers. EU data storage by default.</p></Section>
  </>);
}

/* ───── RESOURCES ───── */
function BlogPage() {
  return (<><PageHeader page="blog" />
    <div className="grid gap-4 sm:grid-cols-2">
      {[["Introducing Tirbeo Chat", "Real-time messaging for professional communities.", "Jun 27"],
        ["Tirbeo Raises $5M Seed Round", "Seed round led by XYZ Ventures.", "Jun 20"],
        ["Enterprise SSO Launch", "SAML, OIDC, and audit logging.", "Jun 10"],
        ["Community Insights", "Analytics dashboard for admins.", "Jun 5"],
        ["10K Communities Milestone", "A huge milestone for the platform.", "May 28"],
        ["API v2 Launch", "New endpoints and webhooks.", "May 15"],
      ].map(([t, d, date]) => <Glass key={t} className="p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20"><span className="text-xs text-white/30">{date}</span><h3 className="mt-1 text-base font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-white/50">{d}</p></Glass>)}
    </div>
  </>);
}

function FAQPage() {
  return (<><PageHeader page="faq" />
    <div className="space-y-3">
      {[["What is Tirbeo?", "A parent company behind a suite of professional community workspace products. Our first product is Tirbeo Chat."],
        ["What is Tirbeo Chat?", "A real-time messaging platform for professional communities — channels, threads, voice/video, and more."],
        ["Is Tirbeo free?", "Free tier includes community access and core features. Premium plans available."],
        ["Can I self-host?", "Available for Enterprise customers."],
        ["How is data protected?", "End-to-end encryption, SOC 2, EU server options."],
        ["Can I migrate from Discord/Slack?", "Yes. Import tools available."],
      ].map(([q, a]) => <Glass key={q} className="p-5 transition-all duration-300 hover:border-white/20"><h3 className="text-base font-semibold text-white">{q}</h3><p className="mt-2 text-sm text-white/50">{a}</p></Glass>)}
    </div>
  </>);
}

function CommunityPage() {
  return (<><PageHeader page="community" />
    <div className="grid gap-4 sm:grid-cols-2">
      {[["Discord", "discord.gg/tirbeo", "discord"], ["GitHub", "github.com/TIRBEO", "github"], ["Twitter", "@tirbeo", "twitter"], ["LinkedIn", "/company/tirbeo", "linkedin"]].map(([n, h, i]) => (
        <a key={n} href={`https://${i === "github" ? "github.com/TIRBEO" : i === "discord" ? "discord.gg/tirbeo" : `${i}.com/tirbeo`}`} target="_blank" rel="noopener noreferrer" className="group">
          <Glass className="p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
            <Icon name={i} className="mx-auto h-10 w-10 text-white/60" /><h3 className="mt-3 text-lg font-semibold text-white">{n}</h3><p className="mt-1 text-sm text-white/50">{h}</p>
          </Glass>
        </a>
      ))}
    </div>
  </>);
}

function ContactPage() {
  return (<><PageHeader page="contact" />
    <div className="grid gap-4 sm:grid-cols-3">
      {[["Email", "hello@tirbeo.com"], ["Twitter", "@tirbeo"], ["Discord", "/tirbeo"]].map(([t, d]) => <Glass key={t} className="p-5 text-center transition-all duration-300 hover:border-white/20"><h3 className="text-sm font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-white/50">{d}</p></Glass>)}
    </div>
    <div className="mt-6">
      <Glass className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Send a message</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Your name" className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-2xl focus:border-white/20 focus:outline-none" />
          <input type="email" placeholder="Your email" className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-2xl focus:border-white/20 focus:outline-none" />
          <textarea rows={4} placeholder="Your message" className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-2xl focus:border-white/20 focus:outline-none" />
          <button className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-white/90 active:scale-[0.97]">Send Message</button>
        </div>
      </Glass>
    </div>
  </>);
}
