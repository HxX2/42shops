"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RotateCw } from "lucide-react";
import { PixelArt } from "@/components/pixel-art";

export default function ShopsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const rateLimited = /429/.test(error.message);
  return (
    <div className="flex flex-col items-center px-6 py-24 text-center">
      <motion.div animate={{ y: [0, -10, 0], rotate: [0, -4, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
        <PixelArt sprite="ghost" scale={8} />
      </motion.div>
      <h1 className="mt-8 font-display text-5xl">The 42 API didn&apos;t answer</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        {rateLimited
          ? "Too many requests went out at once. Wait a few seconds, then load the shop again."
          : "The shop data couldn't be loaded. Load it again, and if this keeps happening, check the app credentials in your environment variables."}
      </p>
      <div className="mt-8 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-white transition-colors hover:bg-blue"
        >
          <RotateCw size={15} className="transition-transform duration-500 group-hover:rotate-180" />
          Load again
        </motion.button>
        <Link href="/shops" className="rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-ink">
          All campuses
        </Link>
      </div>
    </div>
  );
}
