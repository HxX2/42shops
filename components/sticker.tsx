"use client";

import { motion } from "motion/react";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";

/** A pixel sticker that pops onto the page and can be dragged around. */
export function Sticker({
  children,
  className,
  rotate = 0,
  delay = 0,
  bob = true,
  constraints,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
  bob?: boolean;
  constraints?: RefObject<HTMLElement | null>;
  label?: string;
}) {
  return (
    <motion.div
      className={cn("absolute z-10 cursor-grab touch-none select-none active:cursor-grabbing", className)}
      initial={{ opacity: 0, scale: 0.2, rotate: rotate - 30 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay }}
      drag
      dragConstraints={constraints}
      dragElastic={0.18}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
      whileHover={{ scale: 1.12, rotate: rotate + 8 }}
      whileDrag={{ scale: 1.2, rotate: rotate - 10, zIndex: 50 }}
      title={label ? `${label} (drag me)` : "Drag me"}
    >
      <motion.div
        animate={bob ? { y: [0, -6, 0] } : undefined}
        transition={bob ? { duration: 3.2 + delay, repeat: Infinity, ease: "easeInOut" } : undefined}
        className="drop-shadow-[0_6px_6px_rgba(0,0,0,0.18)]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
