/** 히어로. 배경 이미지와 카피는 site_settings 에서 읽어올 예정이다. (YP-7) */
export function Hero() {
  return (
    <section className="relative flex min-h-[60vh] items-center bg-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <p className="text-xs tracking-[0.3em] text-zinc-400">
          YOO &amp; PARTNERS
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {/* TODO: site_settings.hero_headline */}
          히어로 카피 영역
        </h1>
        <p className="mt-4 max-w-md text-sm text-zinc-400">
          {/* TODO: site_settings.hero_subline */}
          부제 영역
        </p>
      </div>
    </section>
  );
}
