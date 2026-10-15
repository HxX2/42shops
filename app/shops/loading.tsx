export default function Loading() {
  return (
    <div className="px-5 pb-16 pt-4 sm:px-10" aria-busy="true" aria-label="Loading campuses">
      <div className="skeleton h-20 w-[min(100%,34rem)] rounded-2xl" />
      <div className="skeleton mt-4 h-4 w-80 max-w-full rounded-full" />
      <div className="skeleton mt-12 h-[210px] max-w-2xl rounded-[22px]" />
      <div className="skeleton mt-12 h-13 rounded-2xl" />
      {[0, 1].map((s) => (
        <div key={s} className="mt-12">
          <div className="skeleton h-8 w-48 rounded-lg" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-[68px] rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
