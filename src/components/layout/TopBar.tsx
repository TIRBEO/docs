import { Icon } from "../ui/Icon";
import { GlassButton } from "../ui/Glass";

export function TopBar({ onMenuClick, pageTitle }: { onMenuClick: () => void; pageTitle?: string }) {
  const title = pageTitle || "Docs";
  return (
    <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-3xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center bg-white/[0.04] text-white/40 backdrop-blur-2xl transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" className="h-4 w-4" />
        </button>
        <nav className="hidden items-center gap-1.5 text-sm text-white/40 sm:flex">
          <a href="/#home" className="transition-colors hover:text-white">Home</a>
          <Icon name="chevron-right" className="h-3 w-3 text-white/20" />
          <span className="font-medium text-white">{title}</span>
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
