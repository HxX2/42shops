"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowLeft, Search, X } from "lucide-react";
import type { Campus, CountryGroup, Product } from "@/lib/types";
import { cn, formatNumber, normalize, productStatus } from "@/lib/utils";
import { CampusSwitcher } from "./campus-switcher";
import { Segmented, SortMenu } from "./controls";
import { PixelArt } from "./pixel-art";
import { Price, ProductCard, ProductModal, type ShopItem } from "./product";
import { Sticker } from "./sticker";
import { StickyNote } from "./sticky-note";

type Filter = "all" | "available" | "affordable" | "unavailable";
type Sort = "featured" | "price-asc" | "price-desc" | "name" | "newest";

const STATUS_RANK = { available: 0, upcoming: 1, soldout: 2, ended: 3 } as const;

const SORTS: Array<{ value: Sort; label: string }> = [
  { value: "featured", label: "In stock first" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
];

function Num({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-ink tabular">{children}</span>;
}

export function ShopView({
  campus,
  code,
  groups,
  products,
  wallet,
  homeCampusId,
  now,
}: {
  campus: Campus;
  code: string;
  groups: CountryGroup[];
  products: Product[];
  wallet: number;
  homeCampusId: number | null;
  now: number;
}) {
  const items: ShopItem[] = useMemo(
    () => products.map((p) => ({ ...p, status: productStatus(p, now) })),
    [products, now],
  );

  const counts = useMemo(() => {
    const available = items.filter((i) => i.status === "available");
    return {
      all: items.length,
      available: available.length,
      affordable: available.filter((i) => i.price <= wallet).length,
      unavailable: items.length - available.length,
    };
  }, [items, wallet]);

  const priceRange = useMemo(() => {
    const prices = items.filter((i) => i.status === "available").map((i) => i.price);
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null;
  }, [items]);

  const [filter, setFilter] = useState<Filter>(counts.available > 0 ? "available" : "all");
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const constraints = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    let list = items.filter((i) => {
      if (filter === "available" && i.status !== "available") return false;
      if (filter === "affordable" && (i.status !== "available" || i.price > wallet)) return false;
      if (filter === "unavailable" && i.status === "available") return false;
      if (q && !normalize(`${i.name} ${i.description}`).includes(q)) return false;
      return true;
    });
    const byNewest = (a: ShopItem, b: ShopItem) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || b.id - a.id;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price || a.name.localeCompare(b.name);
        case "price-desc":
          return b.price - a.price || a.name.localeCompare(b.name);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return byNewest(a, b);
        default:
          return STATUS_RANK[a.status] - STATUS_RANK[b.status] || byNewest(a, b);
      }
    });
    return list;
  }, [items, filter, sort, query, wallet]);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const closeModal = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetFilters = () => {
    setQuery("");
    setFilter("all");
  };

  const walletNote = (() => {
    if (counts.available === 0) return <>You have <Price value={wallet} className="text-sm" />. Nothing is in stock here right now.</>;
    if (counts.affordable === 0)
      return <>You have <Price value={wallet} className="text-sm" />. Nothing in stock fits yet. The cheapest item is <Price value={priceRange?.min ?? 0} className="text-sm" />.</>;
    if (counts.affordable === counts.available)
      return <>You have <Price value={wallet} className="text-sm" />. That covers every item in stock here.</>;
    return (
      <>
        You have <Price value={wallet} className="text-sm" />. That covers {counts.affordable} of the {counts.available} items in stock.
      </>
    );
  })();

  return (
    <div className="px-5 pb-16 sm:px-10">
      <div className="flex items-center justify-between gap-3 pb-6">
        <Link
          href="/shops"
          className="group inline-flex h-10 items-center gap-2 rounded-full pr-3 text-sm text-muted transition-colors hover:text-ink"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white transition-all duration-300 ease-out-expo group-hover:-translate-x-1 group-hover:border-ink">
            <ArrowLeft size={15} />
          </span>
          All campuses
        </Link>
        <CampusSwitcher groups={groups} current={campus} open={switcherOpen} onOpenChange={setSwitcherOpen} />
      </div>

      <section ref={constraints} className="relative grid gap-8 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-grid h-6 min-w-6 place-items-center rounded-[5px] bg-ink px-1 font-pixel text-[10px] leading-none text-white">
              {code}
            </span>
            {[campus.city, campus.country].filter(Boolean).join(", ")}
            {campus.id === homeCampusId ? (
              <span className="rounded-full bg-blue-wash px-2 py-0.5 text-[11px] font-medium text-blue">Your campus</span>
            ) : null}
          </p>
          <h1 className="mt-3 font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.88] tracking-[-0.02em]">{campus.name}</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            {items.length === 0 ? (
              <>This shop is empty for now.</>
            ) : (
              <>
                <Num>{formatNumber(counts.all)}</Num> {counts.all === 1 ? "item" : "items"} listed, <Num>{formatNumber(counts.available)}</Num> in stock.
                {priceRange ? (
                  <>
                    {" "}
                    {priceRange.min === priceRange.max ? (
                      <>Everything costs <Price value={priceRange.min} className="text-[13px] text-ink" />.</>
                    ) : (
                      <>
                        Prices run from <Price value={priceRange.min} className="text-[13px] text-ink" /> to{" "}
                        <Price value={priceRange.max} className="text-[13px] text-ink" />.
                      </>
                    )}
                  </>
                ) : null}
              </>
            )}
          </p>
        </div>

        <div className="relative hidden lg:block">
          <StickyNote className="w-64" rotate={2.5} delay={0.2} pin={<PixelArt sprite="coin" scale={4} />}>
            {walletNote}
          </StickyNote>
        </div>
        <Sticker className="right-[300px] top-0 hidden xl:block" rotate={-14} delay={0.5} constraints={constraints} label="Star">
          <PixelArt sprite="star" scale={4} />
        </Sticker>
      </section>

      {/* Mobile wallet line, since the sticky note is desktop-only */}
      <p className="-mt-4 mb-6 rounded-2xl bg-sticky/60 px-4 py-3 font-hand text-[15px] lg:hidden">{walletNote}</p>

      {items.length > 0 ? (
        <div className="sticky top-2 z-30 -mx-2 mb-8 flex flex-col gap-2 rounded-[22px] bg-white/80 p-2 backdrop-blur-md sm:top-3 sm:mb-10 md:flex-row md:items-center">
          <label className="group relative flex flex-1 items-center rounded-full border border-line bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-blue focus-within:shadow-[0_0_0_4px_var(--color-blue-wash)]">
            <Search size={16} className="pointer-events-none absolute left-4 text-muted group-focus-within:text-blue" aria-hidden />
            <span className="sr-only">Search items</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this shop"
              className="h-10 w-full bg-transparent pl-10 pr-10 text-sm outline-none placeholder:text-muted/80"
              autoComplete="off"
              spellCheck={false}
            />
            <AnimatePresence mode="popLayout">
              {!query ? (
                <motion.kbd
                  key="kbd"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute right-3 hidden h-5 min-w-5 select-none items-center justify-center rounded-[5px] border border-line bg-wash px-1.5 font-mono text-[10px] font-medium text-muted shadow-2xs sm:inline-flex"
                >
                  /
                </motion.kbd>
              ) : (
                <motion.button
                  key="clear"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => setQuery("")}
                  className="absolute right-2 grid h-6 w-6 place-items-center rounded-full bg-wash text-muted hover:bg-ink hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </motion.button>
              )}
            </AnimatePresence>
          </label>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Segmented
                id="shop-filter"
                label="Filter items"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "available", label: "In stock", count: counts.available },
                  { value: "affordable", label: "In budget", count: counts.affordable },
                  { value: "unavailable", label: "Unavailable", count: counts.unavailable },
                  { value: "all", label: "All", count: counts.all },
                ]}
              />
            </div>
            <SortMenu value={sort} onChange={setSort} options={SORTS} />
          </div>
        </div>
      ) : null}

      <LayoutGroup>
        <motion.div layout className="relative mt-4 sm:mt-6 grid grid-cols-2 gap-x-3.5 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16 } }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  delay: Math.min(i, 10) * 0.025,
                  layout: { type: "spring", stiffness: 380, damping: 34 },
                }}
                className={cn(selectedId === item.id && "z-10")}
              >
                <ProductCard item={item} wallet={wallet} onOpen={() => setSelectedId(item.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <ProductModal item={selected} wallet={wallet} isHomeCampus={campus.id === homeCampusId} onClose={closeModal} />
      </LayoutGroup>

      <AnimatePresence>
        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <PixelArt sprite="ghost" scale={6} />
            </motion.div>
            {items.length === 0 ? (
              <>
                <p className="mt-6 font-display text-3xl">{campus.name} hasn&apos;t listed anything yet</p>
                <p className="mt-2 max-w-sm text-sm text-muted">Shops get restocked from time to time. Meanwhile, another campus might have what you want.</p>
                <button
                  onClick={() => setSwitcherOpen(true)}
                  className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm text-white transition-colors hover:bg-blue"
                >
                  Switch campus
                </button>
              </>
            ) : (
              <>
                <p className="mt-6 font-display text-3xl">Nothing matches these filters</p>
                <p className="mt-2 text-sm text-muted">
                  {query ? <>No item mentions &ldquo;{query}&rdquo; here.</> : <>Try another filter to see more items.</>}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-ink"
                >
                  Show every item
                </button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
