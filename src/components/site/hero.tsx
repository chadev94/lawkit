import type { HomeSection } from "@/lib/sections";

export function Hero({ section }: { section: HomeSection }) {
  return (
    <section className="flex min-h-[60vh] items-center bg-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <p className="text-xs tracking-[0.3em] text-zinc-400">
          YOO &amp; PARTNERS
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {section.title ?? "히어로 카피"}
        </h1>
        {section.subtitle && (
          <p className="mt-4 max-w-md text-sm text-zinc-400">{section.subtitle}</p>
        )}
      </div>
    </section>
  );
}
