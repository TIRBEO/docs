import { GlassPill } from "./Glass";

export function PageHeader({ category, title, description }: { category?: string; title: string; description?: string }) {
  return (
    <div className="mb-10">
      {category && <GlassPill className="mb-3">{category}</GlassPill>}
      {!category && <GlassPill className="mb-3">Documentation</GlassPill>}
      <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight text-white">{title}</h1>
      {description && <p className="mt-2 text-lg text-white/50">{description}</p>}
    </div>
  );
}
