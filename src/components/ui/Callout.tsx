import { Info, AlertTriangle } from "lucide-react";

export function Callout({ variant, className = "", children }: { variant: "info" | "warning" | "success" | "danger"; className?: string; children: React.ReactNode }) {
  const icons = { info: Info, warning: AlertTriangle, success: Info, danger: AlertTriangle };
  const IconComp = icons[variant];
  return (
    <div className={`flex items-start gap-3 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/60 backdrop-blur-2xl ${className}`}>
      <IconComp className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
      <div>{children}</div>
    </div>
  );
}
