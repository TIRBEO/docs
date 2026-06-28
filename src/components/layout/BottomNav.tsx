import type { NavItem } from "../../types";
import { Icon } from "../ui/Icon";

export function BottomNav({ prev, next, currentIndex, total }: { prev: NavItem | null; next: NavItem | null; currentIndex: number; total: number }) {
  return (
    <div className="mt-16 flex items-center gap-4 pt-8">
      {prev ? (
        <a href={`/#${prev.slug}`}
          className="group flex flex-1 items-center gap-2 bg-white/[0.04] px-5 py-3.5 backdrop-blur-2xl transition-all hover:bg-white/[0.08]"
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
        <a href={`/#${next.slug}`}
          className="group flex flex-1 items-center gap-2 bg-white/[0.04] px-5 py-3.5 backdrop-blur-2xl transition-all hover:bg-white/[0.08]"
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
