import { BookOpen, ThumbsUp, ThumbsDown, Code2 } from "lucide-react";
import { Glass } from "../ui/Glass";
import { GlassButton } from "../ui/Glass";

export function RightSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 xl:block">
      <div className="sticky top-[73px] space-y-4">
        <Glass className="p-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
            <BookOpen className="h-3.5 w-3.5" />On this page
          </span>
          <nav className="mt-3 space-y-1.5 text-sm">
            <a href="#overview" className="flex items-center gap-2 text-white/50 transition-colors hover:text-white">
              <span className="h-1 w-1 bg-white/40" />Overview
            </a>
            <a href="#features" className="flex items-center gap-2 pl-3 text-white/40 transition-colors hover:text-white/70">Features</a>
            <a href="#guide" className="flex items-center gap-2 pl-3 text-white/40 transition-colors hover:text-white/70">Guide</a>
          </nav>
        </Glass>
        <Glass className="p-4">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Helpful?</span>
          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 bg-white/[0.04] px-3 py-2 text-xs text-white/40 backdrop-blur-2xl transition-all hover:bg-white/[0.08] hover:text-white active:scale-95">
              <ThumbsUp className="h-3.5 w-3.5" />Yes
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 bg-white/[0.04] px-3 py-2 text-xs text-white/40 backdrop-blur-2xl transition-all hover:bg-white/[0.08] hover:text-white active:scale-95">
              <ThumbsDown className="h-3.5 w-3.5" />No
            </button>
          </div>
        </Glass>
        <GlassButton href="https://github.com/TIRBEO/docs" target="_blank" rel="noopener noreferrer" className="w-full justify-center">
          <Code2 className="h-4 w-4" />Edit on GitHub
        </GlassButton>
      </div>
    </aside>
  );
}
