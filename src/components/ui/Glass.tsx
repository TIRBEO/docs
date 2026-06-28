export function Glass({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-2xl ${className}`} {...props}>{children}</div>;
}

export function GlassPill({ className = "", children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/60 backdrop-blur-2xl ${className}`} {...props}>{children}</span>;
}

export function GlassButton({ className = "", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const Tag = (props as any).href !== undefined ? "a" : "button";
  return <Tag className={`inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-sm text-white/50 backdrop-blur-2xl transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white active:scale-[0.97] ${className}`} {...(props as any)}>{children}</Tag>;
}

export function GlassCard({ title, description, className = "" }: { title: string; description: string; className?: string }) {
  return (
    <Glass className={`group p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06] ${className}`}>
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{description}</p>
    </Glass>
  );
}

export function GlassTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
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
