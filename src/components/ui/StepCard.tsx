import { Glass } from "./Glass";

export function StepCard({ number, title, children }: { number: number; title: string; children?: React.ReactNode }) {
  return (
    <Glass className="flex items-start gap-4 p-5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.06]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/[0.06] font-mono text-sm font-bold text-white/80">{number}</span>
      <div className="flex-1">
        <h4 className="mb-1 text-sm font-semibold text-white">{title}</h4>
        <div className="text-sm leading-relaxed text-white/50">{children}</div>
      </div>
    </Glass>
  );
}
