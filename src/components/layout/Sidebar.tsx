import type { NavItem, NavGroup } from "../../types";
import { Icon } from "../ui/Icon";
import { GlassPill } from "../ui/Glass";

function SidebarNavItem({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <a href={`/#${item.slug}`} onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-1.5 text-sm transition-all rounded ${
        active
          ? "bg-white/[0.08] font-medium text-white border-l-2 border-white"
          : "text-white/40 hover:bg-white/[0.04] hover:text-white/70 border-l-2 border-transparent"
      }`}
    >
      {item.label}
    </a>
  );
}

function SidebarGroup({ group, expanded, onToggle, activePage, onItemClick }: {
  group: NavGroup; expanded: boolean; onToggle: () => void; activePage: string; onItemClick: () => void;
}) {
  return (
    <div className="mb-4">
      <button onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase tracking-[0.08em] text-white/60 transition-colors hover:text-white/90 border-b border-white/5"
      >
        <Icon name="chevron-right" className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        {group.label}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-0.5 ml-2 border-l border-white/5 pl-2">
          {group.items.map((item) => (
            <SidebarNavItem key={item.slug} item={item} active={activePage === item.slug} onClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  open, onClose, page, expanded, onToggle, searchQuery, onSearchChange, filteredItems, searchRef, groups,
}: {
  open: boolean; onClose: () => void; page: string;
  expanded: Record<string, boolean>; onToggle: (label: string) => void;
  searchQuery: string; onSearchChange: (q: string) => void;
  filteredItems: NavItem[]; searchRef: React.RefObject<HTMLDivElement | null>;
  groups: NavGroup[];
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-black backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center bg-white text-sm font-bold text-black">T</span>
        <span className="font-semibold tracking-tight text-white">Tirbeo</span>
        <GlassPill>Docs</GlassPill>
        <button onClick={onClose} className="ml-auto p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white lg:hidden">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>

      <div ref={searchRef} className="relative px-4 py-3">
        <Icon name="search" className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text" placeholder="Search..." value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/[0.04] py-2 pl-9 pr-10 text-sm text-white placeholder:text-white/20 backdrop-blur-2xl focus:bg-white/[0.06] focus:outline-none"
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-white/30">⌘K</span>
        {searchQuery && filteredItems.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 overflow-hidden bg-black backdrop-blur-2xl">
            {filteredItems.map((item) => (
              <a key={item.slug} href={`/#${item.slug}`}
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

      <div className="px-3 py-3">
        <a href="https://github.com/TIRBEO" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/40 transition-all hover:bg-white/[0.04] hover:text-white/70"
        >
          <Icon name="github" className="h-4 w-4" />
          <span className="flex-1">TIRBEO on GitHub</span>
          <Icon name="external-link" className="h-3 w-3 text-white/20" />
        </a>
      </div>
    </aside>
  );
}
