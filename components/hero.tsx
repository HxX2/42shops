"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, type Variants } from "motion/react";
import { ArrowDown, ArrowRight, X } from "lucide-react";
import { Brand } from "./brand";
import { Gear } from "./gear";
import { Marquee } from "./marquee";
import { PixelArt } from "./pixel-art";
import { CornerHandles } from "./selection-frame";
import { Sticker } from "./sticker";
import { StickyNote } from "./sticky-note";

type Notice = { tone: "info" | "error"; text: string } | null;

const CITIES = [
  "Paris", "Ben Guerir", "Tokyo", "Heilbronn", "Lisboa", "Seoul", "Abu Dhabi", "Madrid",
  "Khouribga", "São Paulo", "Bangkok", "Kuala Lumpur", "Prague", "Vienna", "Amman", "Singapore",
];

const line: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
};
const line2: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.38 } },
};
const letter: Variants = {
  hidden: { y: "70%", opacity: 0, filter: "blur(10px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 220, damping: 20 },
  },
};

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <motion.span key={`${ch}-${i}`} variants={letter} className="inline-block">
          {ch}
        </motion.span>
      ))}
    </>
  );
}

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Hero({
  user,
  next,
  notice,
}: {
  user: { login: string; image: string | null } | null;
  next: string;
  notice: Notice;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [showNotice, setShowNotice] = useState(Boolean(notice));

  const ctaClass =
    "group relative inline-flex items-center gap-3 border border-line bg-white px-6 py-3.5 font-hand text-lg text-ink transition-colors duration-200 hover:border-blue hover:text-blue";

  return (
    <main className="sheet relative flex min-h-[calc(100dvh-1rem)] flex-col overflow-hidden sm:min-h-[calc(100dvh-2rem)]">
      <header className="relative z-30 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
        <Brand />
        {user ? (
          <Link
            href="/shops"
            className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm transition-colors hover:border-ink"
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : null}
            {user.login}
          </Link>
        ) : (
          <span className="hidden text-sm text-muted sm:block">For the 42 network</span>
        )}
      </header>

      <AnimatePresence>
        {notice && showNotice ? (
          <motion.div
            role={notice.tone === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed bottom-8 left-1/2 z-50 flex w-[min(92%,30rem)] -translate-x-1/2 items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg ${
              notice.tone === "error" ? "border-heart/30 bg-white text-ink" : "border-blue/20 bg-blue-wash text-ink"
            }`}
          >
            <PixelArt sprite={notice.tone === "error" ? "ghost" : "sparkle"} scale={2} className="mt-0.5 shrink-0" />
            <p className="flex-1">{notice.text}</p>
            <button
              onClick={() => setShowNotice(false)}
              className="rounded-md p-0.5 text-muted transition-colors hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div ref={stage} className="canvas-grid relative mx-3 flex flex-1 flex-col items-center justify-center rounded-[22px] px-4 pb-10 pt-6 sm:mx-6">
        <Sticker className="left-[8%] top-[10%] sm:left-[18%] sm:top-[14%]" rotate={-12} delay={0.7} constraints={stage} label="Heart">
          <PixelArt sprite="heart" scale={5} />
        </Sticker>
        <Sticker className="right-[8%] top-[8%] sm:right-[20%] sm:top-[12%]" rotate={10} delay={0.85} constraints={stage} label="Wallet coin">
          <PixelArt sprite="coin" scale={7} />
        </Sticker>
        <Sticker className="bottom-[16%] left-[6%] hidden sm:block sm:left-[14%]" rotate={-6} delay={1} constraints={stage} label="Shopping bag">
          <PixelArt sprite="bag" scale={7} />
        </Sticker>
        <Sticker className="right-[30%] top-[46%] hidden lg:block" rotate={14} delay={1.15} constraints={stage} label="Star">
          <PixelArt sprite="star" scale={4} />
        </Sticker>

        <h1 className="relative z-0 select-none text-center font-display uppercase leading-[0.82] tracking-[-0.03em] text-[clamp(4.2rem,15vw,12.5rem)]">
          <motion.span variants={line} initial="hidden" animate="show" className="block">
            <Letters text="Campus" />
          </motion.span>
          <motion.span
            variants={line2}
            initial="hidden"
            animate="show"
            className="flex items-center justify-center"
          >
            <Letters text="Sh" />
            <motion.span variants={letter} className="mx-[0.03em] inline-flex h-[0.72em] w-[0.72em] translate-y-[-0.04em]">
              <Gear className="h-full w-full cursor-pointer" label="O" />
            </motion.span>
            <Letters text="ps" />
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-md text-center text-[15px] leading-relaxed text-muted"
        >
          The intra shop of every 42 campus in one place. Pick a country, pick a campus, and see what your wallet can buy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, type: "spring", stiffness: 260, damping: 22 }}
          className="mt-8"
        >
          <Magnetic>
            {user ? (
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link href="/shops" className={ctaClass}>
                  <CornerHandles className="text-[#bdbdc4] group-hover:text-blue" />
                  Open the shops
                  <ArrowRight size={18} className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : (
              <motion.a
                whileTap={{ scale: 0.96 }}
                href={`/api/auth/login?next=${encodeURIComponent(next)}`}
                className={ctaClass}
              >
                <CornerHandles className="text-[#bdbdc4] group-hover:text-blue" />
                Sign in with 42
                <ArrowDown size={18} className="transition-transform duration-300 ease-out-expo group-hover:translate-y-0.5" />
              </motion.a>
            )}
          </Magnetic>
        </motion.div>

        <div className="absolute bottom-[9%] right-[5%] z-10 hidden w-56 md:block lg:right-[10%]">
          <StickyNote rotate={3} delay={1.2} pin={<PixelArt sprite="envelope" scale={4} />}>
            Prices are in ₳, the same wallet points you earn at 42. Your balance shows up after you sign in.
          </StickyNote>
        </div>
      </div>

      <Marquee items={CITIES} className="mt-4 -rotate-1 scale-[1.02]" />
      <div className="h-5" />
    </main>
  );
}
