"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Check, ExternalLink, X } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { PixelArt } from "./pixel-art";
import { SelectionFrame } from "./selection-frame";

export type ShopItem = Product & { status: ProductStatus };

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------
export function Price({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-pixel leading-none tabular", className)}>
      {value === 0 ? "Free" : `₳${formatNumber(value)}`}
    </span>
  );
}

function StatusBadge({ item }: { item: ShopItem }) {
  const map: Record<ProductStatus, { text: string; dot: string; cls: string }> = {
    available: { text: "In stock", dot: "bg-go", cls: "bg-white text-ink" },
    soldout: { text: "Sold out", dot: "bg-muted", cls: "bg-white/90 text-muted" },
    upcoming: {
      text: item.beginAt ? `Opens ${formatDate(item.beginAt)}` : "Coming soon",
      dot: "bg-blue",
      cls: "bg-white text-ink",
    },
    ended: { text: item.endAt ? `Ended ${formatDate(item.endAt)}` : "Ended", dot: "bg-muted", cls: "bg-white/90 text-muted" },
  };
  const s = map[item.status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm", s.cls)}>
      <span className="relative flex h-1.5 w-1.5">
        {item.status === "available" ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-go opacity-60" />
        ) : null}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", s.dot)} />
      </span>
      {s.text}
    </span>
  );
}

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center">
        <PixelArt sprite="bag" scale={6} className="opacity-90" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn(
        "h-full w-full object-contain transition-[opacity,filter] duration-500",
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
        className,
      )}
    />
  );
}

function Affordability({ price, wallet, compact }: { price: number; wallet: number; compact?: boolean }) {
  if (wallet >= price) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue">
        <Check size={13} strokeWidth={2.5} /> {compact ? "In your budget" : "Your wallet covers this"}
      </span>
    );
  }
  const pct = Math.max(4, Math.min(100, (wallet / price) * 100));
  return (
    <span className="flex w-full items-center gap-2 text-xs text-muted">
      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-coin"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </span>
      <span className="shrink-0 tabular">₳{formatNumber(price - wallet)} short</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
const cardVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -4, transition: { type: "spring", stiffness: 400, damping: 22 } },
};
const imageVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.06, rotate: -2, transition: { type: "spring", stiffness: 300, damping: 18 } },
};

export function ProductCard({ item, wallet, onOpen }: { item: ShopItem; wallet: number; onOpen: () => void }) {
  const dimmed = item.status === "soldout" || item.status === "ended";
  const lowStock = item.status === "available" && item.quantity !== null && item.quantity <= 10;

  return (
    <motion.button
      layoutId={`product-${item.id}`}
      onClick={onOpen}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      variants={cardVariants}
      style={{ borderRadius: 22 }}
      className="group relative flex h-full w-full flex-col border border-line bg-white p-2.5 text-left"
      aria-label={`${item.name}, ${item.price === 0 ? "free" : `${item.price} wallet points`}. Show details`}
    >
      <SelectionFrame label={item.slug ?? `item-${item.id}`} />
      <motion.div
        layoutId={`product-media-${item.id}`}
        style={{ borderRadius: 16 }}
        className="relative aspect-square overflow-hidden bg-wash"
      >
        <motion.div variants={imageVariants} className={cn("h-full w-full p-6", dimmed && "opacity-45 grayscale")}>
          <ProductImage src={item.image} alt="" />
        </motion.div>
        <span className="absolute left-2.5 top-2.5">
          <StatusBadge item={item} />
        </span>
        {lowStock ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-heart px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
            {item.quantity} left
          </span>
        ) : null}
      </motion.div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("line-clamp-2 text-[15px] font-medium leading-snug", dimmed && "text-muted")}>{item.name}</h3>
          <Price value={item.price} className="mt-0.5 shrink-0 text-[13px]" />
        </div>
        <div className="mt-auto flex min-h-6 items-end pt-3">
          {item.status === "available" || item.status === "upcoming" ? (
            <Affordability price={item.price} wallet={wallet} compact />
          ) : (
            <span className="text-xs text-muted">{item.oneTimePurchase ? "One per person" : "Not available now"}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function ProductModal({
  item,
  wallet,
  isHomeCampus,
  onClose,
}: {
  item: ShopItem | null;
  wallet: number;
  isHomeCampus: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!item) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      opener?.focus?.({ preventScroll: true });
    };
  }, [item, onClose]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {item ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" key="product-modal">
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            layoutId={`product-${item.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`product-title-${item.id}`}
            style={{ borderRadius: 28 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="relative z-10 grid max-h-[92dvh] w-full max-w-4xl overflow-hidden bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] md:grid-cols-[1.05fr_1fr]"
          >
            <motion.div
              layoutId={`product-media-${item.id}`}
              style={{ borderRadius: 20 }}
              className="relative m-3 aspect-[4/3] overflow-hidden bg-wash md:aspect-auto md:min-h-[420px]"
            >
              <div className={cn("absolute inset-0 p-10", (item.status === "soldout" || item.status === "ended") && "opacity-50 grayscale")}>
                <ProductImage src={item.image} alt={item.name} />
              </div>
              <span className="absolute left-3 top-3">
                <StatusBadge item={item} />
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex min-h-0 flex-col overflow-y-auto px-6 pb-6 pt-2 md:pt-8"
            >
              <h2 id={`product-title-${item.id}`} className="pr-10 font-display text-4xl leading-[1.02] sm:text-[2.75rem]">
                {item.name}
              </h2>
              <Price value={item.price} className="mt-4 text-2xl" />

              {item.description ? (
                <p className="mt-5 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-muted">{item.description}</p>
              ) : null}

              <dl className="mt-6">
                <Fact label="Stock">
                  {item.quantity === null ? "No limit" : item.quantity <= 0 ? "None left" : `${formatNumber(item.quantity)} left`}
                </Fact>
                {item.oneTimePurchase ? <Fact label="Limit">One per person</Fact> : null}
                {item.isUnique ? <Fact label="Ownership">Unique item</Fact> : null}
                {item.beginAt ? <Fact label="Available from">{formatDate(item.beginAt)}</Fact> : null}
                {item.endAt ? <Fact label="Available until">{formatDate(item.endAt)}</Fact> : null}
              </dl>

              <div className="mt-6 rounded-2xl bg-wash p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <PixelArt sprite="coin" scale={2} />
                    Your wallet
                  </span>
                  <Price value={wallet} className="text-[13px]" />
                </div>
                <div className="mt-3">
                  {wallet >= item.price ? (
                    <p className="text-sm text-ink">
                      <span className="font-medium text-blue">You can afford this.</span> You&apos;d keep{" "}
                      <Price value={wallet - item.price} className="text-xs" /> after buying it.
                    </p>
                  ) : (
                    <Affordability price={item.price} wallet={wallet} />
                  )}
                </div>
              </div>

              {isHomeCampus ? (
                <a
                  href="https://shop.intra.42.fr"
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue"
                >
                  Open the intra shop
                  <ExternalLink size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : (
                <p className="mt-5 text-xs leading-relaxed text-muted">
                  Purchases happen on intra, from your own campus shop.
                </p>
              )}
            </motion.div>

            <motion.button
              ref={closeRef}
              onClick={onClose}
              initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, transition: { delay: 0.15, type: "spring", stiffness: 400, damping: 22 } }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-md md:right-5 md:top-5"
              aria-label="Close details"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
