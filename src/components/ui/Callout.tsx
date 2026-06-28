import { Info, AlertTriangle } from "lucide-react";

export function Callout({ variant, className = "", children }: { variant: "info" | "warning" | "success" | "danger"; className?: string; children: React.ReactNode }) {
  const borders = { info: "border-l-white/30", warning: "border-l-white/40", success: "border-l-white/40", danger: "border-l-white/50" };
  const icons = { info: Info, warning: AlertTriangle, success: Info, danger: AlertTriangle };
  const IconComp = icons[variant];
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-white/[0.07] border-l-4 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/60 backdrop-blur-2xl ${borders[variant]} ${className}`}>
      <IconComp className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
      <div>{children}</div>
    </div>
  );
}
