export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 id={id} className="group mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight text-white">
        <a href={`#${id}`} className="after:ml-2 after:text-white/30 after:opacity-0 after:transition-opacity after:content-['#'] hover:after:opacity-100">{title}</a>
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-white/50">{children}</div>
    </section>
  );
}
