"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const frame: Variants = {
  rest: { opacity: 0, scale: 1.015 },
  hover: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 500, damping: 32 } },
};

const handle: Variants = {
  rest: { scale: 0 },
  hover: (i: number) => ({
    scale: 1,
    transition: { type: "spring", stiffness: 600, damping: 22, delay: 0.03 * i },
  }),
};

const corners = ["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-right-[4px] -bottom-[4px]", "-left-[4px] -bottom-[4px]"];
const smallCorners = ["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-right-[3px] -bottom-[3px]", "-left-[3px] -bottom-[3px]"];

/**
 * A design-tool style selection box. Lives inside a motion parent that
 * switches between the "rest" and "hover" variants.
 */
export function SelectionFrame({
  label,
  className,
  position = "right",
  labelPosition,
}: {
  label?: string;
  className?: string;
  position?: "left" | "right";
  labelPosition?: "left" | "right";
}) {
  const align = labelPosition ?? position;
  return (
    <motion.span
      aria-hidden
      variants={frame}
      className={cn("pointer-events-none absolute -inset-[5px] z-20 rounded-none border border-blue", className)}
    >
      {corners.map((pos, i) => (
        <motion.span
          key={pos}
          custom={i}
          variants={handle}
          className={cn("absolute h-[7px] w-[7px] border border-blue bg-white", pos)}
        />
      ))}
      {label ? (
        <span
          className={cn(
            "absolute -top-[26px] max-w-[85%] truncate rounded-[4px] bg-blue px-1.5 py-0.5 text-[10px] font-medium leading-tight text-white",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {label}
        </span>
      ) : null}
    </motion.span>
  );
}

/** Static grey handles, as seen on the reference CTA buttons. */
export function CornerHandles({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {smallCorners.map((pos) => (
        <span
          key={pos}
          className={cn("absolute h-[6px] w-[6px] border border-current bg-white transition-colors duration-200", pos)}
        />
      ))}
    </span>
  );
}
