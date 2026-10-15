import { PixelArt } from "@/components/pixel-art";

export default function Loading() {
  return (
    <div className="px-5 pb-16 sm:px-10" aria-busy="true" aria-label="Loading shop">
      <div className="flex items-center justify-between pb-6">
        <div className="skeleton h-8 w-36 rounded-full" />
        <div className="skeleton h-10 w-44 rounded-full" />
      </div>
      <div className="flex items-end justify-between gap-6 pb-10">
        <div className="flex-1">
          <div className="skeleton h-5 w-40 rounded-full" />
          <div className="skeleton mt-4 h-24 w-[min(100%,30rem)] rounded-2xl" />
          <div className="skeleton mt-5 h-4 w-[min(100%,26rem)] rounded-full" />
        </div>
        <div className="hidden h-36 w-64 rotate-2 items-center justify-center gap-3 bg-sticky/70 lg:flex">
          <span className="animate-bounce">
            <PixelArt sprite="coin" scale={4} />
          </span>
          <span className="font-hand text-lg">Counting coins…</span>
        </div>
      </div>
      <div className="skeleton mb-6 h-14 rounded-[22px]" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-[22px] border border-line p-2.5">
            <div className="skeleton aspect-square rounded-2xl" style={{ animationDelay: `${i * 90}ms` }} />
            <div className="skeleton mt-3 h-4 w-3/4 rounded-full" />
            <div className="skeleton mt-3 h-3 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
