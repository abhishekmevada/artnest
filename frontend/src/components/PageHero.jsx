export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="px-6 pt-20 pb-14 text-center">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-neutral)]">
          {eyebrow}
        </p>
      )}
      <h1 className="mx-auto max-w-4xl font-['Playfair_Display'] text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-neutral)]">
          {subtitle}
        </p>
      )}
    </section>
  );
}
