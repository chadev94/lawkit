export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <p className="text-sm tracking-[0.2em] text-zinc-400">CHAMELEONDEV</p>
      <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
        카멜레온데브 배포 테스트
      </h1>
      <p className="text-sm text-zinc-500">
        이 페이지가 보이면 배포 파이프라인이 정상 동작하는 것입니다.
      </p>
    </main>
  );
}
