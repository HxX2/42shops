"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, Loader2, Search, Users, X } from "lucide-react";
import type { Campus, CountryGroup } from "@/lib/types";
import { campusCity, cn, formatNumber, normalize } from "@/lib/utils";
import { PixelArt } from "./pixel-art";
import { SelectionFrame } from "./selection-frame";
import { StickyNote } from "./sticky-note";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

function CodeBadge({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid h-8 min-w-8 place-items-center rounded-[6px] bg-ink px-1.5 font-pixel text-[12px] leading-none text-white",
        className,
      )}
    >
      {code}
    </span>
  );
}

function ArrowStatus() {
  const { pending } = useLinkStatus();
  return (
    <motion.span
      variants={{
        rest: { backgroundColor: "#f4f4f6", color: "#000000", rotate: 0 },
        hover: { backgroundColor: "#2f6bff", color: "#ffffff", rotate: 45 },
      }}
      transition={spring}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpRight size={15} />}
    </motion.span>
  );
}

function CampusCard({
  campus,
  isHome,
  ref,
}: {
  campus: Campus;
  isHome: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      transition={spring}
      className="relative"
    >
      <motion.div initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: 0.98 }} className="relative rounded-2xl">
        <SelectionFrame label={`Open ${campus.name}`} />
        <Link
          href={`/shops/${campus.id}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-[15px] font-medium">{campus.name}</span>
              {isHome ? (
                <span className="shrink-0 rounded-full bg-blue-wash px-2 py-0.5 text-[11px] font-medium text-blue">
                  Home
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 flex items-center gap-3 text-[13px] text-muted">
              {campusCity(campus) ? <span className="truncate">{campusCity(campus)}</span> : null}
              <span className="flex shrink-0 items-center gap-1 tabular">
                <Users size={12} aria-hidden />
                {formatNumber(campus.usersCount)}
                <span className="sr-only">students</span>
              </span>
            </span>
          </span>
          <ArrowStatus />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function HomeFolder({ campus, code }: { campus: Campus; code: string }) {
  return (
    <motion.div initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: 0.985 }} className="relative">
      <Link href={`/shops/${campus.id}`} className="relative block h-[232px] rounded-[22px] sm:h-[210px]">
        <span className="absolute left-0 top-0 h-7 w-44 rounded-t-[14px] bg-blue-deep" aria-hidden />
        <span className="absolute inset-x-0 bottom-0 top-5 rounded-[22px] rounded-tl-none bg-blue-deep" aria-hidden />
        <motion.span
          aria-hidden
          variants={{ rest: { y: 0, rotate: 0 }, hover: { y: -26, rotate: -2 } }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-x-8 top-8 flex h-28 items-start gap-3 rounded-xl bg-white p-4 shadow-md"
        >
          <PixelArt sprite="coin" scale={3} />
          <span className="flex flex-1 flex-col gap-2 pt-1">
            <span className="h-2 w-2/3 rounded-full bg-wash" />
            <span className="h-2 w-1/2 rounded-full bg-wash" />
          </span>
        </motion.span>
        <motion.span
          variants={{ rest: { rotateX: 0 }, hover: { rotateX: -14 } }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ transformOrigin: "50% 100%", transformPerspective: 900 }}
          className="absolute inset-x-0 bottom-0 top-[4.5rem] flex items-end justify-between gap-4 rounded-[22px] bg-blue p-5 text-white sm:px-6 sm:py-5"
        >
          <span className="min-w-0">
            <span className="block text-sm text-white/75">Your home campus</span>
            <span className="mt-0.5 block truncate font-display text-3xl leading-[1.12] pb-1 sm:text-[42px]">{campus.name}</span>
            <span className="mt-1 flex items-center gap-2 text-xs text-white/80 sm:text-[13px]">
              <CodeBadge code={code} className="h-5.5 min-w-5.5 bg-white/15 text-[10px]" />
              {[campus.city, campus.country].filter(Boolean).join(", ")}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-blue">
            Open shop
            <ArrowUpRight size={15} />
          </span>
        </motion.span>
      </Link>
    </motion.div>
  );
}

function MostViewedFolder({
  campus,
  code,
  views,
}: {
  campus: Campus;
  code: string;
  views: number;
}) {
  return (
    <motion.div initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: 0.985 }} className="relative">
      <Link href={`/shops/${campus.id}`} className="relative block h-[232px] rounded-[22px] sm:h-[210px]">
        {/* Back and Tab in deep golden amber */}
        <span className="absolute left-0 top-0 h-7 w-44 rounded-t-[14px] bg-[#d49c00]" aria-hidden />
        <span className="absolute inset-x-0 bottom-0 top-5 rounded-[22px] rounded-tl-none bg-[#d49c00]" aria-hidden />

        {/* Paper slip-out with star sprite */}
        <motion.span
          aria-hidden
          variants={{ rest: { y: 0, rotate: 0 }, hover: { y: -26, rotate: 2 } }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-x-8 top-8 flex h-28 items-start gap-3 rounded-xl bg-white p-4 shadow-md"
        >
          <PixelArt sprite="star" scale={3} />
          <span className="flex flex-1 flex-col gap-2 pt-1">
            <span className="h-2 w-2/3 rounded-full bg-wash" />
            <span className="h-2 w-1/2 rounded-full bg-wash" />
          </span>
        </motion.span>

        {/* Front flap in yellow (--color-sticky / bg-sticky) */}
        <motion.span
          variants={{ rest: { rotateX: 0 }, hover: { rotateX: -14 } }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ transformOrigin: "50% 100%", transformPerspective: 900 }}
          className="absolute inset-x-0 bottom-0 top-[4.5rem] flex items-end justify-between gap-4 rounded-[22px] bg-sticky p-5 text-ink sm:px-6 sm:py-5"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="block text-sm font-medium text-ink/75">Most viewed</span>
              {views > 0 ? (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-ink">
                  {views} {views === 1 ? "view" : "views"}
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate font-display text-3xl leading-[1.12] pb-1 sm:text-[42px]">{campus.name}</span>
            <span className="mt-1 flex items-center gap-2 text-xs text-ink/80 sm:text-[13px]">
              <CodeBadge code={code} className="h-5.5 min-w-5.5 bg-black/15 text-[10px] text-ink" />
              {[campus.city, campus.country].filter(Boolean).join(", ")}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-transform group-hover:scale-105">
            Open shop
            <ArrowUpRight size={15} />
          </span>
        </motion.span>
      </Link>
    </motion.div>
  );
}

export function CampusDirectory({
  groups,
  homeCampusId,
  mostViewedCampusId,
  mostViewedCount = 0,
}: {
  groups: CountryGroup[];
  homeCampusId: number | null;
  mostViewedCampusId?: number | null;
  mostViewedCount?: number;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCampuses = groups.reduce((n, g) => n + g.campuses.length, 0);
  const home = useMemo(() => {
    for (const g of groups) {
      const c = g.campuses.find((x) => x.id === homeCampusId);
      if (c) return { campus: c, code: g.code };
    }
    return null;
  }, [groups, homeCampusId]);

  const mostViewed = useMemo(() => {
    if (!mostViewedCampusId) return null;
    for (const g of groups) {
      const c = g.campuses.find((x) => x.id === mostViewedCampusId);
      if (c) return { campus: c, code: g.code };
    }
    return null;
  }, [groups, mostViewedCampusId]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return groups;
    return groups
      .map((g) => {
        if (normalize(g.country).includes(q) || g.code.toLowerCase() === q) return g;
        const campuses = g.campuses.filter((c) => normalize(`${c.name} ${c.city}`).includes(q));
        return { ...g, campuses };
      })
      .filter((g) => g.campuses.length > 0);
  }, [groups, query]);

  const resultCount = filtered.reduce((n, g) => n + g.campuses.length, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(target.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="px-5 pb-16 sm:px-10">
      <section className="grid gap-10 pb-10 pt-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.02em]">
            Choose a campus
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            {formatNumber(totalCampuses)} campuses in {formatNumber(groups.length)} countries. Open one to see everything
            its shop sells, what&apos;s in stock, and what your wallet covers.
          </p>
        </div>
        <StickyNote className="hidden w-60 justify-self-end lg:block" rotate={-3} delay={0.25} pin={<PixelArt sprite="pinkHeart" scale={3} />}>
          Press <kbd className="rounded border border-black/20 bg-white/50 px-1 font-sans text-sm">/</kbd> to search. Country names work too, like &ldquo;Morocco&rdquo;.
        </StickyNote>
      </section>

      {home || mostViewed ? (
        <section className="mb-12 flex flex-wrap gap-6 items-start">
          {home ? (
            <div className="w-full sm:w-[460px] max-w-full">
              <HomeFolder campus={home.campus} code={home.code} />
            </div>
          ) : null}
          {mostViewed ? (
            <div className="w-full sm:w-[460px] max-w-full">
              <MostViewedFolder
                campus={mostViewed.campus}
                code={mostViewed.code}
                views={mostViewedCount}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="sticky top-2 z-30 -mx-2 mb-8 rounded-[20px] bg-white/80 px-2 py-2 backdrop-blur-md sm:top-3">
        <label className="group relative flex items-center rounded-2xl border border-line bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-blue focus-within:shadow-[0_0_0_4px_var(--color-blue-wash)]">
          <Search size={18} className="pointer-events-none absolute left-4 text-muted transition-colors group-focus-within:text-blue" aria-hidden />
          <span className="sr-only">Search campuses</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by campus, city or country"
            className="h-13 w-full bg-transparent pl-11 pr-32 text-[15px] outline-none placeholder:text-muted/80"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="absolute right-3 flex items-center gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={resultCount}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="text-xs text-muted tabular"
              >
                {resultCount} found
              </motion.span>
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {!query ? (
                <motion.kbd
                  key="kbd"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none hidden h-5 min-w-5 select-none items-center justify-center rounded-[5px] border border-line bg-wash px-1.5 font-mono text-[11px] font-medium text-muted shadow-2xs sm:inline-flex"
                >
                  /
                </motion.kbd>
              ) : (
                <motion.button
                  key="clear"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={spring}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full bg-wash text-muted transition-colors hover:bg-ink hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </span>
        </label>

        <AnimatePresence initial={false}>
          {!query ? (
            <motion.nav
              aria-label="Jump to country"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pt-2">
                {groups.map((g) => (
                  <motion.a
                    key={g.country}
                    href={`#country-${g.code}`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    className="shrink-0 rounded-[6px] border border-line bg-white px-2 py-1 font-pixel text-[11px] transition-colors hover:border-ink hover:bg-ink hover:text-white"
                    title={g.country}
                  >
                    {g.code}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>

      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((g) => (
            <motion.section
              layout
              key={g.country}
              id={`country-${g.code}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={spring}
              className="mb-12 scroll-mt-40"
            >
              <motion.header layout="position" className="mb-4 flex items-center gap-3">
                <CodeBadge code={g.code} />
                <h2 className="font-display text-3xl leading-none sm:text-4xl">{g.country}</h2>
                <span className="ml-auto text-sm text-muted tabular">
                  {g.campuses.length} {g.campuses.length === 1 ? "campus" : "campuses"}
                </span>
              </motion.header>
              <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {g.campuses.map((c) => (
                    <CampusCard key={c.id} campus={c} isHome={c.id === homeCampusId} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </LayoutGroup>

      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-20 text-center"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <PixelArt sprite="ghost" scale={6} />
            </motion.div>
            <p className="mt-6 font-display text-3xl">No campus matches &ldquo;{query}&rdquo;</p>
            <p className="mt-2 text-sm text-muted">Try a city or a country name instead.</p>
            <button
              onClick={() => setQuery("")}
              className="mt-6 rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-ink"
            >
              Show all campuses
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
