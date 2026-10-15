"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Gear } from "./gear";
import { PixelArt } from "./pixel-art";
import { CornerHandles } from "./selection-frame";
import { Sticker } from "./sticker";

export function NotFoundView() {
  const stage = useRef<HTMLDivElement>(null);
  return (
    <main ref={stage} className="sheet canvas-grid relative flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center overflow-hidden px-6 sm:min-h-[calc(100dvh-2rem)]">
      <Sticker className="left-[10%] top-[18%]" rotate={-16} delay={0.3} constraints={stage} label="Bat">
        <PixelArt sprite="bat" scale={6} />
      </Sticker>
      <Sticker className="bottom-[18%] right-[12%]" rotate={12} delay={0.45} constraints={stage} label="Bat">
        <PixelArt sprite="bat" scale={9} />
      </Sticker>

      <h1 className="flex items-center font-display text-[clamp(7rem,26vw,16rem)] leading-none tracking-[-0.04em]" aria-label="404">
        <motion.span initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
          4
        </motion.span>
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          className="mx-[0.04em] inline-flex h-[0.7em] w-[0.7em]"
        >
          <Gear className="h-full w-full" label="0" />
        </motion.span>
        <motion.span initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.2 }}>
          4
        </motion.span>
      </h1>
      <p className="mt-2 text-sm text-muted">This page doesn&apos;t exist, or the campus ID is wrong.</p>
      <motion.div whileTap={{ scale: 0.96 }} className="mt-8">
        <Link
          href="/shops"
          className="group relative inline-flex items-center gap-2 border border-line bg-white px-5 py-3 font-hand text-lg transition-colors hover:border-blue hover:text-blue"
        >
          <CornerHandles className="text-[#bdbdc4] group-hover:text-blue" />
          Back to the campuses
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </main>
  );
}
