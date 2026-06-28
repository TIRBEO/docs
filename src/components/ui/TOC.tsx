import { Glass } from "./Glass";

export function TOC({ items }: { items: { id: string; label: string }[] }) {
  return (
    <Glass className="mb-8 p-4">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Sections</span>
      <ol className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
              <span className="h-1 w-1 bg-white/30" />{item.label}
            </a>
          </li>
        ))}
      </ol>
    </Glass>
  );
}
