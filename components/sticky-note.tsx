"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function StickyNote({
  children,
  className,
  rotate = 2,
  pin,
  delay = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  pin?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotate + 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 16, delay }}
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      className={cn(
        "relative bg-sticky px-5 pb-6 pt-7 font-hand text-[1.05rem] leading-snug text-ink",
        "shadow-[0_1px_0_rgba(0,0,0,0.06),0_18px_28px_-14px_rgba(0,0,0,0.35)]",
        "after:absolute after:bottom-0 after:right-0 after:h-6 after:w-6 after:bg-gradient-to-tl after:from-black/10 after:to-transparent",
        className,
      )}
    >
      {pin ? <div className="absolute -top-5 left-1/2 -translate-x-1/2">{pin}</div> : null}
      {children}
    </motion.div>
  );
}
