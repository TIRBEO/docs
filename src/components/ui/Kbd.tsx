export function Kbd({ children }: { children: string }) {
  return <kbd className="bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-white/60 backdrop-blur-2xl">{children}</kbd>;
}
