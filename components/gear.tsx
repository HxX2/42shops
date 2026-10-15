"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/** The blue cog that stands in for an "O". Spins faster while hovered. */
export function Gear({ className, label = "o" }: { className?: string; label?: string }) {
  const reduce = useReducedMotion();
  const rotate = useMotionValue(0);
  const speed = useSpring(1, { stiffness: 50, damping: 16 });

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    rotate.set((rotate.get() + delta * 0.012 * speed.get()) % 360);
  });

  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      onHoverStart={() => speed.set(9)}
      onHoverEnd={() => speed.set(1)}
      whileTap={{ scale: 0.88 }}
      aria-label={label}
      role="img"
    >
      <motion.svg viewBox="-50 -50 100 100" className="h-full w-full" style={{ rotate }}>
        <g fill="var(--color-blue)">
          {teeth.map((deg) => (
            <rect key={deg} x="-11" y="-49" width="22" height="30" rx="8" transform={`rotate(${deg})`} />
          ))}
          <circle r="33" />
        </g>
      </motion.svg>
    </motion.span>
  );
}
