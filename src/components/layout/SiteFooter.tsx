import { Icon } from "../ui/Icon";

export function SiteFooter() {
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
